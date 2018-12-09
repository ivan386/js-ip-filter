// make_ip_filter
// in:
//  ['203.0.113.53', '203.0.113.114', '198.51.100.23', ...]
// out:
//  "-zij2io 2jhsi 8g 9u3m 4xewq 7e 2m 3u 2i 4s ..."

function make_ip_filter(ip_list)
{
	return ip_list
	
	// Убираем всё лишнее
	.reduce((new_list, value) =>
	{
		if (/^([0-9]+\.){3}[0-9]+$/.test(value))
			new_list.push(value);

		return new_list;
	}, [])
	
	// Преобразуем IP в числа
	.map( ip_string => 
		ip_string
		.split('.')
		.reduce(
			(ip_number, octet, index) =>
				ip_number | (octet << (8*(3-index)))
			, 0
		)
	)
	
	// Сортируем
	.sort((a, b) => a > b)
	
	// Вычисляем дельту между значениями IP
	.map((ip, index, ip_array) =>
	{
		if (index == 0)
			return ip;
		
		// Из текущего значения вычитаем предидущее
		return ip - ip_array[index - 1];
	})
	
	// Заменяем лишние значения количеством повторов
	.reduce((reduced_deltas, delta, index, delta_array) =>
	{
		
		// Первое значение просто складываем в новый список
		if ( index == 0 )
			reduced_deltas.push(delta);
		else
		{
			var last_index = reduced_deltas.length - 1;
			var last_value = reduced_deltas[last_index];
			
			// Учитываем что первое значение в списке может быть отрицательным
			if ( index == 1 || last_value > 0 )
				// Текущую дельту сравниваем с предыдущей
				// и добавляем либо счётчик либо дельту
				reduced_deltas.push(last_value == delta ? 0 : delta);
				
			// Текущую дельту сравниваем с предыдущей
			else if (delta_array[index-1] == delta)
				// 'увеличиваем' счётчик
				reduced_deltas[last_index]--;
			else
				// записываем новую дельту
				reduced_deltas.push(delta);
		}
		
		return reduced_deltas;
	}, [])
	
	// Переводим все числа в Base36
	.map(number => number.toString(36))
	
	//Убираем лишние пробелы перед знаком '-'
	.join(' ').replace(/ -/g, '-')
}