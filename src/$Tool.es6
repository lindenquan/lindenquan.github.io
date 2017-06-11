class Tool {
    static arrayIntersect(arry1, arry2) {
        let set1 = new Set(arry1);
        let set2 = new Set(arry2);
        let intersection = new Set([...set1].filter(x => set2.has(x)));
        return Array.from(intersection);
    }

    //arry1 and arry2 are arrays containing Variable objects
    static varUnion(arry1, arry2) {
        let set1 = new Set(arry1);
        let set2 = new Set(arry2);
        let union = new Set([...set1, ...set2]);
        return Array.from(union);
    }

    static productDecimals(d1, d2) {
        let a1 = (d1 + '').split('.')[1].length
        let a2 = (d1 + '').split('.')[1].length
        let c1 = Math.pow(10, a1)
        let c2 = Math.pow(10, a2)

        return (d1 * c1) * (d2 * c2) / (c1 * c2)
    }

    static stringUnion(str1, str2) {
        let set1 = new Set(str1.split(','));
        let set2 = new Set(str2.split(','));
        let union = new Set([...set1, ...set2]);
        return Array.from(union).join(',');
    }
}
