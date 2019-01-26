
function ranges_to_ip_list(ranges)
{
	var list = []
	for (index in ranges)
		list.push(ranges[index].join("/"));
	return list;
}
