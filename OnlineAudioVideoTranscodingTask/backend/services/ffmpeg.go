package services

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"transcoding-service/models"

	"gorm.io/gorm"
)

type FFmpegService struct {
	db         *gorm.DB
	ffmpegPath string
	mu         sync.Mutex
}

func NewFFmpegService(db *gorm.DB, ffmpegPath string) *FFmpegService {
	return &FFmpegService{
		db:         db,
		ffmpegPath: ffmpegPath,
	}
}

func (s *FFmpegService) Transcode(task *models.Task, outputPath string, onProgress func(progress int)) error {
	ext := strings.ToLower(task.OutputFormat)
	args := []string{
		"-y",
		"-i", task.FilePath,
		"-progress", "pipe:1",
		"-nostats",
	}

	if isAudioFormat(ext) {
		args = append(args, "-vn", "-acodec", audioCodec(ext))
	} else {
		args = append(args, "-vcodec", videoCodec(ext), "-acodec", "aac")
	}

	args = append(args, outputPath)

	cmd := exec.Command(s.ffmpegPath, args...)

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("创建stderr管道失败: %w", err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("创建stdout管道失败: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("启动ffmpeg失败: %w", err)
	}

	duration := s.getDuration(task.FilePath)

	progressRe := regexp.MustCompile(`out_time_ms=(\d+)`)

	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			line := scanner.Text()
			matches := progressRe.FindStringSubmatch(line)
			if len(matches) >= 2 && duration > 0 {
				us, _ := strconv.ParseInt(matches[1], 10, 64)
				secs := float64(us) / 1000000.0
				pct := int((secs / duration) * 100)
				if pct > 100 {
					pct = 100
				}
				if pct > 0 {
					onProgress(pct)
				}
			}
		}
	}()

	var errBuf strings.Builder
	scanner := bufio.NewScanner(stderr)
	for scanner.Scan() {
		errBuf.WriteString(scanner.Text() + "\n")
	}

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("ffmpeg转码失败: %w, 输出: %s", err, errBuf.String())
	}

	return nil
}

func (s *FFmpegService) getDuration(filePath string) float64 {
	cmd := exec.Command(s.ffmpegPath, "-i", filePath, "-show_entries", "format=duration", "-v", "quiet", "-of", "csv=p=0")
	out, err := cmd.Output()
	if err != nil {
		return 0
	}
	d, err := strconv.ParseFloat(strings.TrimSpace(string(out)), 64)
	if err != nil {
		return 0
	}
	return d
}

func isAudioFormat(ext string) bool {
	audioExts := map[string]bool{
		"mp3": true, "wav": true, "aac": true, "ogg": true, "flac": true, "m4a": true,
	}
	return audioExts[ext]
}

func audioCodec(ext string) string {
	codecs := map[string]string{
		"mp3":  "libmp3lame",
		"wav":  "pcm_s16le",
		"aac":  "aac",
		"ogg":  "libvorbis",
		"flac": "flac",
		"m4a":  "aac",
	}
	if c, ok := codecs[ext]; ok {
		return c
	}
	return "aac"
}

func videoCodec(ext string) string {
	codecs := map[string]string{
		"mp4":  "libx264",
		"webm": "libvpx",
		"avi":  "mpeg4",
		"mov":  "libx264",
		"flv":  "flv",
		"mkv":  "libx264",
	}
	if c, ok := codecs[ext]; ok {
		return c
	}
	return "libx264"
}

func FileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
