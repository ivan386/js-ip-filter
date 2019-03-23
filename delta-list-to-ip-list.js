
function to_ip_list(delta_list)
{
	var ip_list = []
	var ip = 0
	for (var i = 0; i < delta_list.length; i++)
	{
		ip += parseInt(delta_list[i], 36)
		if (!isNaN(ip))
			ip_list.push([(ip >>> 8*3) & 255, (ip >>> 8*2) & 255, (ip >>> 8) & 255, ip & 255].join("."));
	}
	return ip_list
}

