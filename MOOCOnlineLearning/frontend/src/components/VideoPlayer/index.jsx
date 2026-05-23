import React, { useRef, useState, useEffect } from 'react'
import { Slider, Button, Space, Tooltip, message } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  FullscreenOutlined,
  VolumeUpOutlined,
  VolumeMuteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import './index.css'

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

const VideoPlayer = ({ src, poster, onTimeUpdate, onEnded, onProgressChange }) => {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [buffered, setBuffered] = useState(0)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight') {
        seekTo(currentTime + 5)
      } else if (e.key === 'ArrowLeft') {
        seekTo(currentTime - 5)
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentTime, muted])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    if (v.buffered.length > 0) {
      setBuffered(v.buffered.end(v.buffered.length - 1))
    }
    onTimeUpdate && onTimeUpdate(v.currentTime, v.duration)
  }

  const handleLoadedMetadata = () => {
    const v = videoRef.current
    if (!v) return
    setDuration(v.duration)
  }

  const handleEnded = () => {
    setPlaying(false)
    onEnded && onEnded()
  }

  const seekTo = (time) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(time, duration))
  }

  const handleSliderChange = (value) => {
    seekTo(value)
  }

  const handleVolumeChange = (value) => {
    setVolume(value / 100)
    if (value > 0 && muted) setMuted(false)
  }

  const toggleMute = () => {
    setMuted(!muted)
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const reload = () => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play()
    setPlaying(true)
  }

  return (
    <div className="video-player-container" ref={containerRef}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="video-element"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onProgress={handleTimeUpdate}
      />
      <div className="video-controls">
        <div className="progress-bar">
          <div
            className="progress-buffered"
            style={{ width: duration ? `${(buffered / duration) * 100}%` : '0%' }}
          />
          <Slider
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSliderChange}
            tooltip={{ formatter: formatTime }}
            className="progress-slider"
          />
        </div>
        <div className="controls-bar">
          <Space size="middle">
            <Tooltip title={playing ? '暂停 (空格)' : '播放 (空格)'}>
              <Button
                type="text"
                shape="circle"
                icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={togglePlay}
              />
            </Tooltip>
            <Tooltip title="重新播放">
              <Button
                type="text"
                shape="circle"
                icon={<ReloadOutlined />}
                onClick={reload}
              />
            </Tooltip>
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </Space>
          <Space size="middle">
            <div className="volume-control">
              <Tooltip title={muted ? '取消静音 (M)' : '静音 (M)'}>
                <Button
                  type="text"
                  shape="circle"
                  icon={muted || volume === 0 ? <VolumeMuteOutlined /> : <VolumeUpOutlined />}
                  onClick={toggleMute}
                />
              </Tooltip>
              <Slider
                min={0}
                max={100}
                value={muted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
            <Tooltip title="全屏 (F)">
              <Button
                type="text"
                shape="circle"
                icon={<FullscreenOutlined />}
                onClick={toggleFullscreen}
              />
            </Tooltip>
          </Space>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
