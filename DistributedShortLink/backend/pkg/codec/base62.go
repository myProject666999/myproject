package codec

const base62Chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func Encode(num uint64) string {
	if num == 0 {
		return string(base62Chars[0])
	}
	var buf [11]byte
	i := len(buf)
	for num > 0 {
		i--
		buf[i] = base62Chars[num%62]
		num /= 62
	}
	return string(buf[i:])
}
