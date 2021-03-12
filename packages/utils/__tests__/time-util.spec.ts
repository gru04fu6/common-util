import * as timeUtil from '../time-util';

describe('time-util', () => {
    describe('formatTime 格式化日期(本地時間)', () => {
        const testDate = new Date('2021/03/10 16:06:32');

        test('預設格式', () => {
            expect(timeUtil.formatTime(testDate)).toBe('2021-03-10 16:06:32');
        });
        test('自訂格式', () => {
            expect(timeUtil.formatTime(testDate, 'YYYY+MM+DD')).toBe('2021+03+10');
            expect(timeUtil.formatTime(testDate, 'HH>mm>ss MM_DD_YYYY')).toBe('16>06>32 03_10_2021');
        });
    });

    describe('formatUTCTime 格式化日期(0時區時間)', () => {
        const testDate = new Date('2021/03/10 07:06:32');

        test('預設格式', () => {
            expect(timeUtil.formatUTCTime(testDate)).toBe('2021-03-09 23:06:32');
        });
        test('自訂格式', () => {
            expect(timeUtil.formatUTCTime(testDate, 'YYYY+MM+DD')).toBe('2021+03+09');
            expect(timeUtil.formatUTCTime(testDate, 'HH>mm>ss MM_DD_YYYY')).toBe('23>06>32 03_09_2021');
        });
    });

    describe('localTimeToZone 把本地時間轉換為其他時區時間', () => {
        const testTime = '2021/03/10 07:06:32';
        const testDate = new Date(testTime);

        const getExpectTime = (timeZone: number) => testDate.getTime() + testDate.getTimezoneOffset() * 60000 + timeZone * 3600000;

        test('-2時區', () => {
            const timeZone = -2;
            expect(timeUtil.localTimeToZone(timeZone, testTime)).toBe(getExpectTime(timeZone));
        });
        test('12時區', () => {
            const timeZone = 12;
            expect(timeUtil.localTimeToZone(timeZone, testTime)).toBe(getExpectTime(timeZone));
        });
    });

    describe('zoneTimeToLocal 把其他時區時間轉換為本地時區', () => {
        const testTime = '2021/03/10 07:06:32';
        const testDate = new Date(testTime);

        const getExpectTime = (timeZone: number) => testDate.getTime() - testDate.getTimezoneOffset() * 60000 - timeZone * 3600000;

        test('-4時區', () => {
            const timeZone = -4;
            expect(timeUtil.zoneTimeToLocal(timeZone, testTime)).toBe(getExpectTime(timeZone));
        });
        test('10時區', () => {
            const timeZone = 10;
            expect(timeUtil.zoneTimeToLocal(timeZone, testTime)).toBe(getExpectTime(timeZone));
        });
    });

    describe('checkDate 判斷時間大小並交換位置', () => {
        test('交換', () => {
            const dates = timeUtil.checkDate('2021/03/10 16:45:00', '2021/03/10 16:44:59');

            expect(dates[0]).toBe('2021/03/10 16:44:59');
            expect(dates[1]).toBe('2021/03/10 16:45:00');
        });
        test('不交換', () => {
            const dates = timeUtil.checkDate('2021/03/10 16:44:59', '2021/03/10 16:45:00');

            expect(dates[0]).toBe('2021/03/10 16:44:59');
            expect(dates[1]).toBe('2021/03/10 16:45:00');
        });
    });
});
