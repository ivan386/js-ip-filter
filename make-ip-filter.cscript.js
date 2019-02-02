
function ip_to_number(ip_string)
{
	for (var index = 0, ip_number = 0
		, octets = ip_string.split('.')
		; octets.length && index < 4
		; index++ )
		ip_number |= parseInt(octets.pop(), 10) << (8*index);
	
	return ip_number;
}

function get_ip(value, end)
{
	if (typeof(value) == "object")
		return end ? value[0] + (1 << value[1]) - 1 : value[0];
	else
		return value;
}

function to_bitset(ip_list)
{
	//*/
	WScript.StdErr.Write("Bitset\n")
	var start_time = new Date()
	//*/
	
	var new_list = []
	var buffer = []
	var bits = 0;
	var gto = 0;
	var mgto = 3;
	for (var index = 0; index < ip_list.length; index++) 
	{
		var value = ip_list[index]
		if 	(typeof(value) == "number")
		{
			if (bits + value > 31 && buffer.length >= 4 && gto >= mgto)
			{
				for(var acum = -1, bitset = 0; buffer.length;)
					bitset |= 1 << (acum+=buffer.shift());
				
				new_list.push({bitset: bitset});
				gto = bits = 0;
			}
			else
				while(buffer.length && bits + value > 31)
				{
					if ( buffer.length > 1 )
						gto -= buffer[0] != buffer[1] ? 1 : 0;
					
					bits -= buffer[0];
					new_list.push(buffer.shift());
				}
				
			if ( buffer.length > 0 )
				gto += buffer[buffer.length - 1] != value ? 1 : 0;
			
			bits += value;
			buffer.push(value);
		}
		else
		{
			if (buffer.length >= 4 && gto >= mgto)
			{
				for(var acum = -1, bitset = 0; buffer.length;)
					bitset |= 1 << (acum+=buffer.shift());
				new_list.push({bitset: bitset})
			}
			else
				while(buffer.length)
					new_list.push(buffer.shift());
			
			gto = bits = 0;
			new_list.push(value);
		}
	}
	
	if (buffer.length >= 4 && gto >= mgto)
	{
		for(var acum = -1, mask = 0; buffer.length;)
			mask |= 1 << (acum+=buffer.shift());
		new_list.push({bits: mask})
	}
	while(buffer.length)
		new_list.push(buffer.shift());
	
	//*/
	WScript.StdErr.Write((new Date()) - start_time  + "\n")
	//*/
	
	return new_list;
}

function to_delta(ip_list)
{
	//*/
	WScript.StdErr.Write("Delta sort\n")
	var start_time = new Date()
	//*/
	
	ip_list = ip_list.sort(function(a, b)
	{
		var diff = a - b;
		
		if (diff > 0 || diff < 0 || diff == 0)
			return diff;
		
		if ( typeof(a) == typeof(b) )
		{
			if (a[0] == b[0]) // Два диапазона начинаются в одной точке
				return b[1] - a[1]; // Ставим больший диапазон раньше
			else
				return a[0] - b[0]; // Сравниваем начала диапазонов
		}
		
		if ( typeof(a) == "object" )
		{
			if ( a[0] == b )
				return -1; // Ставим диапазон 'a' раньше IP адреса 'b' который в него входит
			
			return a[0] - b;
		}

		if ( a == b[0] )
			return 1; // Ставим диапазон 'b' раньше IP адреса 'a' который в него входит
		
		return a - b[0];
		
	})
	
	//*/
	WScript.StdErr.Write((new Date()) - start_time  + "\n")
	WScript.StdErr.Write("Delta calc\n")
	var start_time = new Date()
	//*/
	
	var new_list = [];
	var last_ip;
	for (var index = 0; index < ip_list.length; index++) 
	{
		var ip = ip_list[index]

		if (index == 0)
			new_list.push(ip);
		else
		{
			// Из текущего значения вычитаем предидущее
			var delta_ip = get_ip(ip, false) - get_ip(last_ip, true);
			if (typeof(ip) == "object")
				new_list.push([delta_ip, ip[1]]);
			else if (delta_ip > 0)
				new_list.push(delta_ip);
		}
		
		if (typeof(ip) == "object")
		{
			var range_end = get_ip(ip, true);
			while (range_end >= get_ip(ip_list[index + 1], true))
				index++;
				
			ip_list[index] = ip;
		}
		
		last_ip = ip
	}
	
	//*/
	WScript.StdErr.Write((new Date()) - start_time  + "\n") 
	//*/
	
	return new_list;
}

function parse(ip_list)
{
	//*/
	WScript.StdErr.Write("Parsing\n")
	var start_time = new Date()
	//*/
	
	var new_list = []
	var tester = /^\s*([0-9]+\.){3}[0-9]+\/?[0-9]*\s*$/

	for (var index = 0; index < ip_list.length; index++) 
	{
		var ip_range = ip_list[index]
		if (tester.test(ip_range)) // Это диапазон или ip
		{
			var ip_bits = ip_range.split("/");
			if (ip_bits.length == 2)
				new_list.push([ip_to_number(ip_bits[0]), 32 - parseInt(ip_bits[1])]);
			else
				new_list.push(ip_to_number(ip_range));
		}
	}
	
	//*/
	WScript.StdErr.Write((new Date()) - start_time  + "\n")
	//*/
	
	return new_list;
}

function reduce(ip_list)
{
	//*/
	WScript.StdErr.Write("Reduce\n")
	var start_time = new Date();
	//*/
	
	var new_list = [];
	for (var index = 0; index < ip_list.length; index++) 
	{
		var delta = ip_list[index]
		
		// Первое значение просто складываем в новый список
		if ( index == 0 )
			new_list.push(delta);
		else
		{
			var last_index = new_list.length - 1;
			var last_value = new_list[last_index];
			
			// Учитываем что первое значение в списке может быть отрицательным
			if ( index == 1 || last_value > 0 )
				// Текущую дельту сравниваем с предыдущей
				// и добавляем либо счётчик либо дельту
				new_list.push(last_value === delta ? 0 : delta);
				
			// Текущую дельту сравниваем с предыдущей
			else if (ip_list[index-1] === delta)
				// 'увеличиваем' счётчик
				new_list[last_index]--;
			else
				// записываем новую дельту
				new_list.push(delta);
		}
	}
	
	//*/
	WScript.StdErr.Write((new Date()) - start_time  + "\n")
	//*/
	
	return new_list;
}

function to_string(ip_list)
{
	//*/
	WScript.StdErr.Write("Print\n")
	var start_time = new Date()
	//*/
	
	for (var index = 0; index < ip_list.length; index++) 
	{
		if (typeof(ip_list[index]) == "object")
		{
			if (ip_list[index].push) // range
				ip_list[index] = (index > 0 ? ' ' : '') + ip_list[index][0].toString(36) + "/" + ip_list[index][1].toString(36);
			else if(ip_list[index].bitset) // bitset
				ip_list[index] = "+" + ip_list[index].bitset.toString(36);
		}
		else
			ip_list[index] = (index > 0 && ip_list[index] >= 0 ? ' ' : '') + ip_list[index].toString(36);
	}
	
	//*/
	WScript.StdErr.Write((new Date()) - start_time  + "\n")
	//*/
	
	return  ip_list.join('')
}

function make_ip_filter(ip_list)
{
	return to_string(reduce(to_bitset(to_delta(parse(ip_list)))))
}

if (typeof(WScript) != "undefined")
{
	var ip_list = WScript.StdIn.ReadAll().match(/[^,\s]+/g)
	var ip_filter = make_ip_filter(ip_list);
	WScript.Echo()
	WScript.Echo('var ip_filter="' + ip_filter + '";');
}
	