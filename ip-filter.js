
function unpack_ip_filter(ip_filter)
{
	ip_filter = ip_filter.match(/-?[0-9a-z]+/g);
	
	var ip_number = 0;
	var repeat = 0;
	var ip_dict = {};

	for (var index = 0; index < ip_filter.length; index++)
	{
		var value = parseInt(ip_filter[index], 36);
		
		if (index == 0 || value > 0)
		{
			ip_number += (repeat = value);
			ip_dict[ip_number] = true;
		}
			
		else
		{
			for ( var counter = value
				; counter < 1
				; counter++ )
			{
				ip_number += repeat;
				ip_dict[ip_number] = true;
			}
		}
	}
	
	return ip_dict
}

if (typeof(ip_filter) != "undefined")
	ip_filter = unpack_ip_filter(ip_filter);

function ip_to_number(ip_string)
{
	for (var index = 0, ip_number = 0
		, octets = ip_string.split('.')
		; octets.length && index < 4
		; index++ )
		ip_number |= parseInt(octets.pop(), 10) << (8*index);
	
	return ip_number;
}

function check_ip(ip)
{
	return ip_filter[ip_to_number(ip)]
}
