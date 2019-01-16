function ip_to_number(ip_string)
{
	for (var index = 0, ip_number = 0
		, octets = ip_string.split('.')
		; index < ip_string.length
		; index++ )
		ip_number |= octets[index] << (8*(3-index));
	
	return ip_number;
}

function make_ip_filter(ip_list)
{
	var new_list = []
	
	for (var index = 0; index < ip_list.length; index++) 
	{
		if (/^\s*([0-9]+\.){3}[0-9]+\s*$/.test(ip_list[index]))
			new_list.push(ip_to_number(ip_list[index]));
	}
	
	ip_list = new_list.sort(function(a, b){return a - b})
	new_list = []
	
	for (var index = 0; index < ip_list.length; index++) 
	{
		var ip = ip_list[index]
		
		if (index == 0)
			new_list.push(ip);
		else
			// Из текущего значения вычитаем предидущее
			new_list.push(ip - ip_list[index - 1]);
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
				new_list.push(last_value == delta ? 0 : delta);
				
			// Текущую дельту сравниваем с предыдущей
			else if (ip_list[index-1] == delta)
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
		ip_list[index] = ip_list[index].toString(36)
	}
	
	//Убираем лишние пробелы перед знаком '-'
	return ip_list.join(' ').replace(/ -/g, '-')
}

if (typeof(WScript) != "undefined")
{
	var ip_list = WScript.StdIn.ReadAll().split(",");
	var ip_filter = make_ip_filter(ip_list);
	WScript.Echo('ip_filter="' + ip_filter + '";');
}
	