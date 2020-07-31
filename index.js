#!/usr/bin/env node
const scrapeIt = require('scrape-it');
const Table = require('cli-table3');
const {red, green, gray} = require('chalk');

(async () => {
    const {data} = await scrapeIt('https://covidlive.com.au/cases', {
        root: {
            listItem: 'section.DAILY-CASES',
            data: {
                name: 'h2',
                rows: {
                    listItem: 'tr.odd,tr.even',
                    data: {
                        date: '.DATE',
                        total: '.CASES',
                        change: '.NET'
                    }
                }
            }
        }
    });

    const active = await scrapeIt('https://covidlive.com.au/active-cases', {
        root: {
            listItem: 'section.DAILY-ACTIVE-CASES',
            data: {
                name: 'h2',
                active: {
                    selector: '.ACTIVE',
                    eq: -1
                }
            }
        }
    });

    const table = new Table({
        chars: {
            top: ' ',
            'top-mid': ' ',
            'top-left': '',
            'top-right': '',
            bottom: '-',
            'bottom-mid': '-',
            'bottom-left': '',
            'bottom-right': '',
            left: '',
            'left-mid': '',
            mid: '-',
            'mid-mid': '-',
            right: '',
            'right-mid': '',
            middle: ' '
        },
        style: {head: []},
        head: [
            '',
            ...data.root[0].rows.map((ii) => ii.date.split(' ').slice(0, 2).join(' ')),
            'Active',
            'Total'
        ]
    });

    let rows = [];
    data.root.forEach((ii, index) => {
        const title = index === 0 ? 'National' : ii.name.replace(' Cases', '');
        rows.push(
            [title]
                .concat(
                    ii.rows.map(({change}, index) => {
                        const last = ii.rows[index - 1] || {change: 0};
                        if (change == 0) return gray(change);
                        return change >= last.change ? red(change) : green(change);
                    })
                )
                .concat(active.data.root[index].active)
                .concat(ii.rows[ii.rows.length - 1].total)
        );
    });
    rows.sort(
        (aa, bb) =>
            parseInt(bb[bb.length - 2].replace(',', '')) -
            parseInt(aa[aa.length - 2].replace(',', ''))
    );
    table.push(...rows);
    console.log(table.toString());
})().catch((e) => console.error(e));
