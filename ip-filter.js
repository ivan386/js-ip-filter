
function set_bit(bits_array, position)
{
	var index = position >>> 5
	var bitn = position & 31
	bits_array[index] = bits_array[index] | (1 << bitn)
}

function get_bit(bits_array, position)
{
	var index = position >>> 5
	var bitn = position & 31
	return (bits_array[index] >>> bitn) & 1
}

function unpack_ip_filter(ip_filter)
{
	ip_filter = ip_filter.match(/-?[0-9a-z]+/g);
	
	var ip_number = 0;
	var repeat = 0;
	var ip_list = [];

	for (var index = 0; index < ip_filter.length; index++)
	{
		var value = parseInt(ip_filter[index], 36);
		
		if (index == 0 || value > 0)
		{
			ip_number += (repeat = value);
			set_bit(ip_list, ip_number);
		}
		else
		{
			for ( var counter = value
				; counter < 1
				; counter++ )
			{
				ip_number += repeat;
				set_bit(ip_list, ip_number);
			}
		}
	}
	
	return ip_list
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
	var ipn = ip_to_number(ip)

	return get_bit(ip_filter, ipn)
}
