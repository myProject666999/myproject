package service

import "websitespeedtest/model"

var Regions = []model.Region{
	{Code: "cn-north", Name: "华北-北京", Lat: 39.9042, Lng: 116.4074},
	{Code: "cn-east", Name: "华东-上海", Lat: 31.2304, Lng: 121.4737},
	{Code: "cn-south", Name: "华南-广州", Lat: 23.1291, Lng: 113.2644},
	{Code: "cn-west", Name: "西部-成都", Lat: 30.5728, Lng: 104.0668},
	{Code: "ap-sg", Name: "亚太-新加坡", Lat: 1.3521, Lng: 103.8198},
	{Code: "us-west", Name: "美国-硅谷", Lat: 37.7749, Lng: -122.4194},
	{Code: "eu-de", Name: "欧洲-法兰克福", Lat: 50.1109, Lng: 8.6821},
	{Code: "au-sydney", Name: "澳洲-悉尼", Lat: -33.8688, Lng: 151.2093},
}

func GetRegions() []model.Region {
	return Regions
}

func GetRegionByCode(code string) *model.Region {
	for _, r := range Regions {
		if r.Code == code {
			return &r
		}
	}
	return nil
}
