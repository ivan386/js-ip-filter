function search(list, value)
{
	var start = 0
	var size = list.length
	var pos = list.length / 2 | 0
	for(;size>0;)
	{
		var list_value = list[start + pos]
		if (list_value == value)
			return start + pos;
		else if (list_value > value)
		{
			size = pos;
			pos = (size / 2) | 0
		}
		else
		{
			size = size - pos - 1
			start = start + pos + 1
			pos = (size / 2) | 0
		}
	}
	return -1;
}

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
	ip_filter = ip_filter.match(/[+-]?[0-9a-z]+\/?[0-9a-z]*/g);
	
	var ip_number = 0;
	var repeat = 0;
	var ip_list = [];
	var ranges = {};
	var bitset = {};

	for (var index = 0; index < ip_filter.length; index++)
	{
		var ip_bits = ip_filter[index].split("/")

		var value = parseInt(ip_bits[0], 36);
		
		if ( ip_bits[0].indexOf("+") === 0 )
		{
			for(var acum = 1; value; ++acum, value >>>= 1)
			{
				if (value & 1)
				{
					ip_number += acum;
					set_bit(bitset, ip_number);
					acum = 0;
				}
			}
		}
		else if (index == 0 || value > 0)
		{
			ip_number += (repeat = value);
			if (ip_bits.length == 1)
				ip_list.push(ip_number);
		}
		else
		{
			for ( var counter = value
				; counter < 1
				; counter++ )
			{
				ip_number += repeat;
				if (ip_bits.length == 1 || counter == 0)
					ip_list.push(ip_number);
			}
		}
		
		if (ip_bits.length == 2)
		{
			var bits = parseInt(ip_bits[1], 36);
			if (typeof(ranges[bits])=="undefined")
				ranges[bits] = {};

			set_bit(ranges[bits], ip_number >>> bits)
			ip_number += (1 << bits) - 1
		}
	}

	return {ip_list:ip_list, ranges:ranges, bitset:bitset}
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
	if(ip)
	{
		var ipn = ip_to_number(ip)
		if (get_bit(ip_filter.bitset, ipn))
			return true;
		else if (search(ip_filter.ip_list, ipn) >= 0)
			return true;
		else
			for (bits in ip_filter.ranges)
				if (get_bit(ip_filter.ranges[bits], ipn >>> bits))
					return true;
	}
	return false;
}
