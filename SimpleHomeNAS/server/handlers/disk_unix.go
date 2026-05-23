//go:build !windows

package handlers

import (
	"syscall"
)

func diskUsage(path string) (DiskUsage, error) {
	du := DiskUsage{Path: path}
	var stat syscall.Statfs_t
	if err := syscall.Statfs(path, &stat); err != nil {
		return du, err
	}
	du.Total = stat.Blocks * uint64(stat.Bsize)
	du.Free = stat.Bavail * uint64(stat.Bsize)
	du.Used = du.Total - du.Free
	if du.Total > 0 {
		du.UsedPct = float64(du.Used) / float64(du.Total) * 100
	}
	return du, nil
}
