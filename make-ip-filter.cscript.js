
function ip_to_number(ip_string)
{
	var octets = ip_string.split('.'), ip_number = 0;
	if (octets.length == 4)
		for (var index = 0; index < 4; index++ )
			ip_number |= octets[3-index] << (8*index);
	
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
	console.log("Bitset")
	var start_time = new Date()
	//*/
	
	var new_list = []
	var length = 0;
	var bits = 0;
	var gto = 0;
	var mgto = 3;
	var compress = function(ip_list, index, length)
	{
		for(var acum = -1, bitset = 0; length; index++, length--)
			bitset |= 1 << (acum+=ip_list[index]);
		
		return {bitset: bitset};
	}
	
	for (var index = 0; index < ip_list.length; index++) 
	{
		var value = ip_list[index]
		if 	(typeof(value) == "number" && index > 0)
		{
			if (bits + value > 31 && length >= 4 && gto >= mgto)
			{
				new_list.push(compress(ip_list, index - length, length));
				length = gto = bits = 0;
			}
			else
				while(length && bits + value > 31)
				{
					var push_value = ip_list[index - length]
					if ( length > 1 )
						gto -= push_value != ip_list[index - length + 1] ? 1 : 0;
					
					bits -= push_value;
					new_list.push(push_value);
					length--;
				}
				
			if ( length > 0 )
				gto += ip_list[index - 1] != value ? 1 : 0;
			
			bits += value;
			length++;
		}
		else
		{
			if (length >= 4 && gto >= mgto)
				new_list.push(compress(ip_list, index - length, length));
			else
				while(length)
					new_list.push(ip_list[index - (length--)]);
			
			length = gto = bits = 0;
			new_list.push(value);
		}
	}
	
	if (length >= 4 && gto >= mgto)
		new_list.push(compress(ip_list, index - length, length));
	while(length)
		new_list.push(ip_list[index - (length--)]);
	
	//*/
	console.log((new Date()) - start_time)
	//*/
	
	return new_list;
}

function to_delta(ip_list)
{
	//*/
	console.log("Delta sort")
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
	console.log((new Date()) - start_time)
	console.log("Delta calc")
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
	console.log((new Date()) - start_time) 
	//*/
	
	return new_list;
}

function parse(ip_list)
{
	//*/
	console.log("Parsing")
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
	console.log((new Date()) - start_time)
	//*/
	
	return new_list;
}

function reduce(ip_list)
{
	//*/
	console.log("Reduce")
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
	console.log((new Date()) - start_time)
	//*/
	
	return new_list;
}

function to_string(ip_list)
{
	//*/
	console.log("Print")
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
	console.log((new Date()) - start_time);
	//*/
	
	return  ip_list.join('')
}

function make_ip_filter(ip_list)
{	
	return to_string(reduce(to_bitset(to_delta(parse(ip_list)))))
}

if (typeof(WScript) != "undefined")
{
	console = {log:function(){
		WScript.StdErr.Write(Array.prototype.join.call(arguments, " ") + "\n")
	}}
	//*/
	console.log("Read")
	var start_time = new Date()
	//*/
	
	var ip_list = WScript.StdIn.ReadAll().match(/[^,\s]+/g)
	
	//*/
	console.log((new Date()) - start_time);
	//*/
	
	var ip_filter = make_ip_filter(ip_list);
	WScript.Echo()
	WScript.Echo('var ip_filter="' + ip_filter + '";');
}
else if(typeof(console) == "undefined")
	console = {log:function(){}};
else if(typeof(console.log) == "undefined")
	console.log = function(){};
	