class Tool {

    static get PRECISION() {
        return 7
    }

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

    static getDecimalLength(decimal) {
        let str = decimal.toString().split('.')
        if (str.length === 1) {
            return 0
        } else {
            return str[1].length
        }

    }

    static formatFloat(num) {
        return parseFloat(num.toFixed(Tool.PRECISION))
    }

    static productDecimals(d1, d2) {
        let a1 = Tool.getDecimalLength(d1)
        let a2 = Tool.getDecimalLength(d2)
        let c1 = Math.pow(10, a1)
        let c2 = Math.pow(10, a2)

        return Tool.formatFloat((d1 * c1) * (d2 * c2) / (c1 * c2))
    }

    static divisionDecimals(d1, d2) {
        let a1 = Tool.getDecimalLength(d1)
        let a2 = Tool.getDecimalLength(d2)
        if (a2 > a1) {
            a1 = a2
        }
        let c1 = Math.pow(10, a1)

        return Tool.formatFloat((d1 * c1) / (d2 * c1))
    }

    static addDecimal(d1, d2) {
        let a1 = Tool.getDecimalLength(d1)
        let a2 = Tool.getDecimalLength(d2)
        if (a2 > a1) {
            a1 = a2
        }
        let c1 = Math.pow(10, a1)

        return Tool.formatFloat(((d1 * c1) + (d2 * c1)) / c1)
    }

    static stringUnion(str1, str2) {
        let set1 = new Set(str1.split(','));
        let set2 = new Set(str2.split(','));
        let union = new Set([...set1, ...set2]);
        return Array.from(union).join(',');
    }

    static permute(arr) {
        let result = [];
        if (arr.length === 1) {
            result[0] = [];
            result[0][0] = arr[0];
            result[1] = [];
            result[1][0] = '-' + arr[0];
            return result;
        }

        let first = arr.splice(0, 1)[0];
        let sub = Tool.permute(arr);
        sub.forEach(function(item) {
            let row = [];
            row[0] = first;
            row = row.concat(item);
            result.push(row);
        });

        sub.forEach(function(item) {
            let row = [];
            row[0] = '-' + first;
            row = row.concat(item);
            result.push(row);
        });

        return result;
    }

    static combination(arr, c) {
        var len = arr.length;
        var result = [];
        var tmp;
        if (c === 1) {
            arr.forEach(function(item) {
                tmp = [];
                tmp[0] = item;
                result.push(tmp);
            });
            return result;
        }

        len = len - c;
        var first;
        var sub;
        for (var i = 0; i <= len; i++) {
            first = arr[i];
            sub = Tool.combination(arr.slice(i + 1), c - 1);
            sub.forEach(function(s) {
                s.unshift(first);
                result.push(s);
            });
        }
        return result;
    }
}