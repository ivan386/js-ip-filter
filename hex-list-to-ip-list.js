
function to_ip_list(hex_list)
{
	var ip_list = []
	for (var i = 0; i < hex_list.length; i++)
	{
		var ip = parseInt(hex_list[i], 16)
		ip_list.push([(ip >> 8*3) & 255, (ip >> 8*2) & 255, (ip >> 8) & 255, ip & 255].join("."))
	}
	return ip_list
}

