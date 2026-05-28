const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class AudioProcessor {
    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        this.exportDir = process.env.EXPORT_DIR || './exports';
        this.waveformDir = process.env.WAVEFORM_DIR || './waveforms';
    }

    async getAudioInfo(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) return reject(err);
                const stream = metadata.streams.find(s => s.codec_type === 'audio');
                resolve({
                    duration: Math.round(metadata.format.duration),
                    fileSize: metadata.format.size,
                    sampleRate: stream ? stream.sample_rate : 44100,
                    channels: stream ? stream.channels : 2,
                    bitrate: Math.round(metadata.format.bit_rate / 1000)
                });
            });
        });
    }

    async generateWaveform(filePath, outputPath) {
        return new Promise((resolve, reject) => {
            const waveformData = [];
            const samples = 1000;
            
            ffmpeg(filePath)
                .audioFilters([
                    {
                        filter: 'aresample',
                        options: '1000'
                    },
                    {
                        filter: 'showspectrum',
                        options: {
                            size: `${samples}x200`,
                            mode: 'combined'
                        }
                    }
                ])
                .format('rawvideo')
                .pipe()
                .on('error', reject)
                .on('end', () => {
                    fs.writeFileSync(outputPath, JSON.stringify(waveformData));
                    resolve(waveformData);
                });
            
            const command = ffmpeg(filePath)
                .audioFilters(`aformat=channel_layouts=mono,showspectrum=s=${samples}x1:mode=separate:data=ints16`)
                .format('data')
                .pipe();
            
            let buffer = Buffer.alloc(0);
            command.on('data', (chunk) => {
                buffer = Buffer.concat([buffer, chunk]);
            });
            
            command.on('end', () => {
                for (let i = 0; i < Math.min(samples, buffer.length / 2); i++) {
                    const value = Math.abs(buffer.readInt16LE(i * 2));
                    waveformData.push(value / 32768);
                }
                fs.writeFileSync(outputPath, JSON.stringify(waveformData));
                resolve(waveformData);
            });
            
            command.on('error', reject);
        });
    }

    async trimAudio(inputPath, outputPath, startTime, endTime) {
        return new Promise((resolve, reject) => {
            const duration = endTime - startTime;
            ffmpeg(inputPath)
                .setStartTime(startTime)
                .setDuration(duration)
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
    }

    async cutSegment(inputPath, outputPath, segmentsToKeep) {
        return new Promise((resolve, reject) => {
            const tempFiles = [];
            const ffmpegCommand = ffmpeg();

            let index = 0;
            for (const segment of segmentsToKeep) {
                const tempFile = path.join(path.dirname(outputPath), `temp_${Date.now()}_${index}.mp3`);
                tempFiles.push(tempFile);
                
                ffmpeg(inputPath)
                    .setStartTime(segment.start)
                    .setDuration(segment.end - segment.start)
                    .output(tempFile)
                    .on('end', () => {
                        index++;
                        if (index === segmentsToKeep.length) {
                            this.concatAudio(tempFiles, outputPath).then(() => {
                                tempFiles.forEach(f => fs.unlinkSync(f));
                                resolve();
                            }).catch(reject);
                        }
                    })
                    .on('error', reject)
                    .run();
            }
        });
    }

    async concatAudio(inputFiles, outputPath) {
        return new Promise((resolve, reject) => {
            const ffmpegCommand = ffmpeg();
            inputFiles.forEach(file => ffmpegCommand.input(file));
            ffmpegCommand
                .on('end', resolve)
                .on('error', reject)
                .mergeToFile(outputPath, path.dirname(outputPath));
        });
    }

    async adjustVolume(inputPath, outputPath, volume) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioFilters(`volume=${volume}dB`)
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
    }

    async applyNoiseReduction(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioFilters('afftdn')
                .output(outputPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
    }

    async exportWithChapters(inputPath, outputPath, chapters) {
        return new Promise((resolve, reject) => {
            const metadataFile = path.join(path.dirname(outputPath), `metadata_${Date.now()}.txt`);
            let metadataContent = ';FFMETADATA1\n';
            
            chapters.forEach((chapter, index) => {
                metadataContent += `[CHAPTER]\n`;
                metadataContent += `TIMEBASE=1/1000\n`;
                metadataContent += `START=${chapter.start_time * 1000}\n`;
                metadataContent += `END=${(chapter.end_time || chapter.start_time + 1) * 1000}\n`;
                metadataContent += `title=${chapter.title}\n`;
                if (chapter.description) {
                    metadataContent += `description=${chapter.description}\n`;
                }
            });
            
            fs.writeFileSync(metadataFile, metadataContent);
            
            ffmpeg(inputPath)
                .input(metadataFile)
                .outputOptions('-map_metadata', '1')
                .output(outputPath)
                .on('end', () => {
                    fs.unlinkSync(metadataFile);
                    resolve();
                })
                .on('error', (err) => {
                    fs.unlinkSync(metadataFile);
                    reject(err);
                })
                .run();
        });
    }
}

module.exports = new AudioProcessor();
