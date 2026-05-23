//go:build windows

package handlers

import (
	"syscall"
	"unsafe"
)

var (
	kernel32              = syscall.NewLazyDLL("kernel32.dll")
	procGetDiskFreeSpaceEx = kernel32.NewProc("GetDiskFreeSpaceExW")
)

func diskUsage(path string) (DiskUsage, error) {
	du := DiskUsage{Path: path}
	var free, total, totalFree uint64
	p, err := syscall.UTF16PtrFromString(path)
	if err != nil {
		return du, err
	}
	ret, _, callErr := procGetDiskFreeSpaceEx.Call(
		uintptr(unsafe.Pointer(p)),
		uintptr(unsafe.Pointer(&free)),
		uintptr(unsafe.Pointer(&total)),
		uintptr(unsafe.Pointer(&totalFree)),
	)
	if ret == 0 {
		return du, callErr
	}
	du.Total = total
	du.Free = free
	du.Used = total - free
	if total > 0 {
		du.UsedPct = float64(du.Used) / float64(total) * 100
	}
	return du, nil
}
