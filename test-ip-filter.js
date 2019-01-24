

if (typeof(WScript) != "undefined")
{
	var ip_list = WScript.StdIn.ReadAll().match(/[^,\n]+/g);
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

