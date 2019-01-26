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

function make_ip_filter(ip_list)
{
	var new_list = []
	
	for (var index = 0; index < ip_list.length; index++) 
	{
		if (/^\s*([0-9]+\.){3}[0-9]+\s*$/.test(ip_list[index])) // Это IP адрес
			new_list.push(ip_to_number(ip_list[index]));
		else if (/^\s*([0-9]+\.){3}[0-9]+\/[0-9]+\s*$/.test(ip_list[index])) // Это диапазон
		{
			var ip_bits = ip_list[index].split("/");
			new_list.push([ip_to_number(ip_bits[0]), 32 - parseInt(ip_bits[1])])
		}
	}
	
	ip_list = new_list.sort(function(a, b)
	{
		if ( typeof(a) == "object" && typeof(b) == "object" )
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
		
		if ( typeof(b) == "object" )
		{
			if ( a == b[0] )
				return 1; // Ставим диапазон 'b' раньше IP адреса 'a' который в него входит
			
			return a - b[0];
		}
		
		return a - b;
	})
	
	new_list = []
	
	for (var index = 0; index < ip_list.length; index++) 
	{
		var ip = ip_list[index]

		if (index == 0)
			new_list.push(ip);
		else
		{
			// Из текущего значения вычитаем предидущее
			var delta_ip = get_ip(ip, false) - get_ip(ip_list[index - 1], true);
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
		
	}
	
	ip_list = new_list
	new_list = []
	
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

	ip_list = new_list
	
	for (var index = 0; index < ip_list.length; index++) 
	{
		if (typeof(ip_list[index]) == "object")
			ip_list[index] = ip_list[index][0].toString(36) + "/" + ip_list[index][1].toString(36);
		else
			ip_list[index] = ip_list[index].toString(36);
	}
	
	//Убираем лишние пробелы перед знаком '-'
	return ip_list.join(' ').replace(/ -/g, '-')
}

if (typeof(WScript) != "undefined")
{
	var ip_list = WScript.StdIn.ReadAll().replace(/,/g,"").split("\n");
	var ip_filter = make_ip_filter(ip_list);
	WScript.Echo()
	WScript.Echo('var ip_filter="' + ip_filter + '";');
}
	