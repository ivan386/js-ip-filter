

if (typeof(WScript) != "undefined")
{
	WScript.StdErr.Write("ip_filter.ip_list: " + ip_filter.ip_list.length + "\n");
	
	var len = 0;
	for (key in  ip_filter.bitset)
		len += 1;
	
	WScript.StdErr.Write("ip_filter.bitset: " + len + "\n");
	
	var len = 0;
	for (bits in  ip_filter.ranges)
	{
		var llen = len;
		for (key in  ip_filter.ranges[bits])
			len += 1;
		
		WScript.StdErr.Write("ip_filter.ranges[" + bits + "]: " + (len - llen) + "\n");
	}
		
	
	WScript.StdErr.Write("ip_filter.ranges: " + len + "\n");
	
	var ip_list = WScript.StdIn.ReadAll().match(/[^,\s]+/g);
	var not_found = 0
	for (var i=0; i < ip_list.length; i++)
	{
		if (!check_ip(ip_list[i]))
		{
			not_found++
			WScript.Echo("Not found: " + ip_list[i]);
		}
		
		if (i % 100 == 0)
			WScript.StdErr.Write("Checked: " + i + ", Not found: " + not_found + "\r");
	}

	WScript.StdErr.Write("Checked: " + i + ", Not found: " + not_found + "\r");
}

