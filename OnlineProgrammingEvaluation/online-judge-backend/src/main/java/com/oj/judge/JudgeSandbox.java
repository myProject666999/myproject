package com.oj.judge;

import com.oj.common.Constants;
import com.oj.entity.Problem;
import com.oj.entity.ProblemCase;
import com.oj.entity.Submission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.*;
import java.util.List;
import java.util.concurrent.*;

@Slf4j
@Component
public class JudgeSandbox {

    private static final String WORK_DIR = System.getProperty("user.dir") + File.separator + "judge" + File.separator + "workspace";

    public JudgeResult judge(Submission submission, Problem problem, List<ProblemCase> cases) {
        String language = submission.getLanguage();
        String code = submission.getCode();
        int timeLimit = problem.getTimeLimit();
        int memoryLimit = problem.getMemoryLimit();
        try {
            Path workDir = Files.createTempDirectory(Path.of(WORK_DIR), "judge-");
            workDir.toFile().mkdirs();
            JudgeResult result;
            switch (language) {
                case Constants.Language.C, Constants.Language.CPP -> result = judgeCpp(workDir, code, cases, timeLimit, memoryLimit, language);
                case Constants.Language.JAVA -> result = judgeJava(workDir, code, cases, timeLimit, memoryLimit);
                case Constants.Language.PYTHON -> result = judgePython(workDir, code, cases, timeLimit, memoryLimit);
                default -> {
                    return JudgeResult.builder().status(Constants.SubmissionStatus.COMPILE_ERROR)
                            .errorMsg("不支持的语言: " + language).build();
                }
            }
            deleteDirectory(workDir.toFile());
            return result;
        } catch (Exception e) {
            log.error("Judge error", e);
            return JudgeResult.builder().status(Constants.SubmissionStatus.SYSTEM_ERROR)
                    .errorMsg("判题系统错误: " + e.getMessage()).build();
        }
    }

    private JudgeResult judgeCpp(Path workDir, String code, List<ProblemCase> cases, int timeLimit, int memoryLimit, String language) throws IOException {
        Path srcFile = workDir.resolve("main.cpp");
        Files.writeString(srcFile, code);
        Path exeFile = workDir.resolve("main");
        StringBuilder compileError = new StringBuilder();
        ProcessBuilder compilePb;
        if (Constants.Language.C.equals(language)) {
            compilePb = new ProcessBuilder("gcc", "-o", exeFile.toString(), srcFile.toString(), "-O2", "-lm");
        } else {
            compilePb = new ProcessBuilder("g++", "-o", exeFile.toString(), srcFile.toString(), "-O2", "-lm");
        }
        Process compileProcess = compilePb.start();
        try {
            compileProcess.waitFor(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        String err = readStream(compileProcess.getErrorStream());
        if (compileProcess.exitValue() != 0) {
            return JudgeResult.builder().status(Constants.SubmissionStatus.COMPILE_ERROR).errorMsg(err).build();
        }
        return runTestCases(exeFile.toString(), null, cases, timeLimit, memoryLimit);
    }

    private JudgeResult judgeJava(Path workDir, String code, List<ProblemCase> cases, int timeLimit, int memoryLimit) throws IOException {
        Path srcFile = workDir.resolve("Main.java");
        Files.writeString(srcFile, code);
        ProcessBuilder compilePb = new ProcessBuilder("javac", srcFile.toString());
        Process compileProcess = compilePb.directory(workDir.toFile()).start();
        try {
            compileProcess.waitFor(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        String err = readStream(compileProcess.getErrorStream());
        if (compileProcess.exitValue() != 0) {
            return JudgeResult.builder().status(Constants.SubmissionStatus.COMPILE_ERROR).errorMsg(err).build();
        }
        String javaCmd = "java -Xmx" + memoryLimit + "m -cp " + workDir + " Main";
        return runTestCases(javaCmd, workDir.toFile(), cases, timeLimit, memoryLimit);
    }

    private JudgeResult judgePython(Path workDir, String code, List<ProblemCase> cases, int timeLimit, int memoryLimit) throws IOException {
        Path srcFile = workDir.resolve("main.py");
        Files.writeString(srcFile, code);
        String pyCmd = "python3 " + srcFile;
        return runTestCases(pyCmd, workDir.toFile(), cases, timeLimit, memoryLimit);
    }

    private JudgeResult runTestCases(String command, File workDir, List<ProblemCase> cases, int timeLimit, int memoryLimit) {
        int passed = 0;
        int maxTimeUsed = 0;
        int maxMemoryUsed = 0;
        StringBuilder errorMsg = new StringBuilder();
        for (int i = 0; i < cases.size(); i++) {
            ProblemCase testCase = cases.get(i);
            try {
                ProcessBuilder pb = new ProcessBuilder("cmd", "/c", command);
                pb.redirectErrorStream(true);
                if (workDir != null) pb.directory(workDir);
                long startTime = System.currentTimeMillis();
                Process process = pb.start();
                try (OutputStream os = process.getOutputStream();
                     InputStream is = process.getInputStream()) {
                    if (testCase.getInput() != null && !testCase.getInput().isEmpty()) {
                        os.write(testCase.getInput().getBytes());
                        os.flush();
                    }
                    os.close();
                    boolean finished = process.waitFor((long) timeLimit + 500, TimeUnit.MILLISECONDS);
                    long timeUsed = System.currentTimeMillis() - startTime;
                    if (!finished) {
                        process.destroyForcibly();
                        return JudgeResult.builder().status(Constants.SubmissionStatus.TIME_LIMIT_EXCEEDED)
                                .timeUsed((int) timeUsed).passedCases(passed).build();
                    }
                    String output = readStream(is);
                    if (process.exitValue() != 0) {
                        return JudgeResult.builder().status(Constants.SubmissionStatus.RUNTIME_ERROR)
                                .errorMsg("测试用例 " + (i + 1) + " 运行错误: " + output)
                                .timeUsed((int) timeUsed).passedCases(passed).build();
                    }
                    String expected = testCase.getOutput().trim().replace("\r\n", "\n");
                    String actual = output.trim().replace("\r\n", "\n");
                    if (expected.equals(actual)) {
                        passed++;
                        maxTimeUsed = Math.max(maxTimeUsed, (int) timeUsed);
                    } else {
                        if (errorMsg.length() == 0) {
                            errorMsg.append("测试用例 ").append(i + 1).append(":\n");
                            errorMsg.append("期望: ").append(expected).append("\n");
                            errorMsg.append("实际: ").append(actual);
                        }
                        return JudgeResult.builder().status(Constants.SubmissionStatus.WRONG_ANSWER)
                                .errorMsg(errorMsg.toString())
                                .timeUsed((int) timeUsed).passedCases(passed).build();
                    }
                }
            } catch (Exception e) {
                return JudgeResult.builder().status(Constants.SubmissionStatus.SYSTEM_ERROR)
                        .errorMsg("判题异常: " + e.getMessage()).passedCases(passed).build();
            }
        }
        return JudgeResult.builder().status(Constants.SubmissionStatus.ACCEPTED)
                .timeUsed(maxTimeUsed).memoryUsed(maxMemoryUsed)
                .passedCases(passed).totalCases(cases.size()).build();
    }

    private String readStream(InputStream is) {
        try {
            StringBuilder sb = new StringBuilder();
            byte[] buffer = new byte[4096];
            int len;
            while ((len = is.read(buffer)) != -1) {
                sb.append(new String(buffer, 0, len));
            }
            return sb.toString();
        } catch (IOException e) {
            return "";
        }
    }

    private void deleteDirectory(File dir) {
        if (dir != null && dir.exists()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File f : files) {
                    if (f.isDirectory()) deleteDirectory(f);
                    else f.delete();
                }
            }
            dir.delete();
        }
    }
}
