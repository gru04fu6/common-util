import * as numberUtil from '../number-util';

describe('number-util', () => {
    describe('formatMoney 每千位數加逗號', () => {
        test('傳number', () => {
            let test = numberUtil.formatMoney(1234567);
            expect(test).toBe('1,234,567');
            test = numberUtil.formatMoney(1234567, true);
            expect(test).toBe('+1,234,567');
            test = numberUtil.formatMoney(-1234567);
            expect(test).toBe('-1,234,567');
            test = numberUtil.formatMoney(-1234567, true);
            expect(test).toBe('-1,234,567');
        });
        test('傳string', () => {
            let test = numberUtil.formatMoney('7654321');
            expect(test).toBe('7,654,321');
            test = numberUtil.formatMoney('7654321', true);
            expect(test).toBe('+7,654,321');
            test = numberUtil.formatMoney('-7654321');
            expect(test).toBe('-7,654,321');
            test = numberUtil.formatMoney('-7654321', true);
            expect(test).toBe('-7,654,321');
        });
        test('傳入非數字', () => {
            const test = numberUtil.formatMoney('不是數字');
            expect(test).toBe('不是數字');
        });
    });

    describe('formatMoneyFixedTwo 每千位數加逗號，小數不足兩位補0', () => {
        test('整數', () => {
            const test = numberUtil.formatMoneyFixedTwo(1234567);
            expect(test).toBe('1,234,567.00');
        });

        test('小數點一位', () => {
            const test = numberUtil.formatMoneyFixedTwo(1234567.2);
            expect(test).toBe('1,234,567.20');
        });

        test('小數點三位', () => {
            const test = numberUtil.formatMoneyFixedTwo(1234567.366);
            expect(test).toBe('1,234,567.366');
        });
    });

    describe('formatOdds 小數點到第二位', () => {
        test('整數', () => {
            const test = numberUtil.formatOdds(1234567);
            expect(test).toBe('1234567.00');
        });

        test('小數點一位', () => {
            const test = numberUtil.formatOdds(1234567.2);
            expect(test).toBe('1234567.20');
        });

        test('小數點三位', () => {
            const test = numberUtil.formatOdds(1234567.366);
            expect(test).toBe('1234567.37');
        });
    });

    describe('numberDecimal 小數點到特定位數', () => {
        test('整數 => 轉成二位', () => {
            const test = numberUtil.numberDecimal(1234567, 2);
            expect(test).toBe('1234567.00');
        });

        test('小數點一位 => 轉成二位', () => {
            const test = numberUtil.numberDecimal(1234567.2, 2);
            expect(test).toBe('1234567.20');
        });

        test('小數點三位 => 轉成二位', () => {
            const test = numberUtil.numberDecimal(1234567.366, 2);
            expect(test).toBe('1234567.37');
        });
    });

    describe('numberFormat 數字格式化，三位一撇+小數點到特定位數', () => {
        test('傳NaN', () => {
            const test = numberUtil.numberFormat('abc', 2);
            expect(test).toBe('abc');
        });

        test('整數 => 轉成二位', () => {
            const test = numberUtil.numberFormat(1234567, 2);
            expect(test).toBe('1,234,567.00');
        });

        test('小數點一位 => 轉成二位', () => {
            const test = numberUtil.numberFormat(1234567.2, 2);
            expect(test).toBe('1,234,567.20');
        });

        test('小數點三位 => 轉成二位', () => {
            const test = numberUtil.numberFormat(1234567.366, 2);
            expect(test).toBe('1,234,567.37');
        });
    });

    describe('formatPercent 將數值轉成百分比', () => {
        test('二位小數', () => {
            const test = numberUtil.formatPercent(0.7632, 2);
            expect(test).toBe('76.32');
        });

        test('一位小數', () => {
            const test = numberUtil.formatPercent(0.7632, 1);
            expect(test).toBe('76.3');
        });
    });

    describe('maybePercentText 檢查是不是百分比文字，若是的話將百分號拿掉', () => {
        test('是百分比文字', () => {
            const testResult = numberUtil.maybePercentText('35.4%');

            expect(testResult.isPercent).toBe(true);
            expect(testResult.text).toBe('35.4');
        });

        test('不是是百分比文字', () => {
            const testResult = numberUtil.maybePercentText('abc');

            expect(testResult.isPercent).toBe(false);
            expect(testResult.text).toBe('abc');
        });
    });

    describe('baseSorter 基本的排序方法', () => {
        test('asc', () => {
            const test1 = [3, 2, 1];
            test1.sort((a, b) => numberUtil.baseSorter(a, b, 'ascend'));

            const test2 = ['c', 'b', 'a'];
            test2.sort((a, b) => numberUtil.baseSorter(a, b, 'ascend'));

            const test3 = ['3%', '2%', '1%'];
            test3.sort((a, b) => numberUtil.baseSorter(a, b, 'ascend'));

            const test4 = ['2023-01-03', '2023-01-02', '2023-01-01'];
            test4.sort((a, b) => numberUtil.baseSorter(a, b, 'ascend'));

            expect(test1[0]).toBe(1);
            expect(test2[0]).toBe('a');
            expect(test3[0]).toBe('1%');
            expect(test4[0]).toBe('2023-01-01');
        });

        test('desc', () => {
            const test1 = [1, 2, 3];
            test1.sort((a, b) => numberUtil.baseSorter(a, b, 'descend'));

            const test2 = ['a', 'b', 'c'];
            test2.sort((a, b) => numberUtil.baseSorter(a, b, 'descend'));

            const test3 = ['1%', '2%', '3%'];
            test3.sort((a, b) => numberUtil.baseSorter(a, b, 'descend'));

            const test4 = ['2023-01-01', '2023-01-02', '2023-01-03'];
            test4.sort((a, b) => numberUtil.baseSorter(a, b, 'descend'));

            expect(test1[2]).toBe(1);
            expect(test2[2]).toBe('a');
            expect(test3[2]).toBe('1%');
            expect(test4[2]).toBe('2023-01-01');
        });


    });

    describe('accMul 乘法', () => {
        test('0.1 * 0.2', () => {
            const test = numberUtil.accMul(0.1, 0.2);
            expect(test).toBe(0.02);
        });

        test('10.1 * 0.01', () => {
            const test = numberUtil.accMul(10.1, 0.01);
            expect(test).toBe(0.101);
        });
    });

    describe('accDiv 除法', () => {
        test('0.02 / 0.1', () => {
            const test = numberUtil.accDiv(0.02, 0.1);
            expect(test).toBe(0.2);
        });

        test('10.04 / 0.1', () => {
            const test = numberUtil.accDiv(10.04, 0.1);
            expect(test).toBe(100.4);
        });
    });

    describe('sizeTransToBytes \'KB\', \'MB\', \'GB\', \'TB\'轉換為Byte的大小', () => {
        test('100KB', () => {
            const test = numberUtil.sizeTransToBytes('100KB');
            expect(test).toBe(102400);
        });

        test('2.5MB', () => {
            const test = numberUtil.sizeTransToBytes('2.5MB');
            expect(test).toBe(2621440);
        });

        test('1GB', () => {
            const test = numberUtil.sizeTransToBytes('1GB');
            expect(test).toBe(1073741824);
        });

        test('非法字串', () => {
            const test = numberUtil.sizeTransToBytes('1AA');
            expect(test).toBe(0);
        });
    });

    describe('bytesTranslate Byte轉換為\'KB\', \'MB\', \'GB\', \'TB\'等單位的大小', () => {
        test('200KB', () => {
            const test = numberUtil.bytesTranslate(204800);
            expect(test).toBe('200KB');
        });

        test('4MB', () => {
            const test = numberUtil.bytesTranslate(4194304);
            expect(test).toBe('4MB');
        });

        test('1.5GB', () => {
            const test = numberUtil.bytesTranslate(1610612736);
            expect(test).toBe('1.5GB');
        });
    });
});
