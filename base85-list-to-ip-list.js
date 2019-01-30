
var base85_alpha="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~"

function to_number(base85)
{
	var value = 0
	for (var i = 0; i < base85.length; i++)
		value = value * 85 + base85_alpha.indexOf(base85.charAt(i));
	return value;
}

function to_ip_list(base58_list)
{
	var ip_list = []
	for (var i = 0; i < base58_list.length; i++)
	{
		var ip = to_number(base58_list[i])
		ip_list.push([(ip >>> 8*3) & 255, (ip >>> 8*2) & 255, (ip >>> 8) & 255, ip & 255].join("."))
	}
	return ip_list
}

