export function arrayToTree(items) {
    const rootItems = [];
    const lookup = {};
 
    for (const item of items) {
        const itemId = item.id;
        lookup[itemId] = item;
        const parentId = item.tid;
        const parent = lookup[parentId];
        if (parent) {
            if (!parent.children) {
                parent.children = [];
            }
            parent.children.push(item);
        }else{
            rootItems.push(item);
        }
    }
    return rootItems;
}