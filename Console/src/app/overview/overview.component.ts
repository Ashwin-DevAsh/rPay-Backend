import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { OverviewService } from './OverviewService';
import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  constructor(public overviewService: OverviewService) {}

  chart: Chart;

  interval = 'hourly';

  isLoading = [];

  ngOnInit() {
    console.log('Mounted');
    this.createGraph();
    this.loadData();
  }

  graphStatus: String = 'Transaction not occure';

  loadData() {
    this.overviewService.clear();

    this.isLoading = [];
    this.overviewService.getTransactionStats().then(() => {
      this.isLoading.push(true);
      this.createGraph();
      this.overviewService.loadMainList();
    });
    this.overviewService.getGeneratedStats().then(() => {
      this.isLoading.push(true);
      this.createGraph();
      this.overviewService.loadMainList();
    });
    this.overviewService.getNoTransactionStats().then(() => {
      this.isLoading.push(true);
      this.createGraph();
      this.overviewService.loadMainList();
    });

    this.overviewService.getWithdrawStats().then(() => {
      this.isLoading.push(true);
      this.createGraph();
      this.overviewService.loadMainList();
    });
  }

  createGraph() {
    if (this.isLoading.length == 4) {
      this.updateMainGraph();
      this.updatePaymentGraph();
      this.updateCashChart();
      this.updateTransactionChart();
      this.updateWithdrawChart();
      this.updateMainGraph();
    }
  }

  updatePaymentGraph = () => {
    var graphContainer = document.getElementsByClassName('myChart-outer')[0];
    document.getElementById('myChartPayments').remove();
    graphContainer.innerHTML +=
      '<canvas  id="myChartPayments" class="myChart" width="100%" height ="20px"><canvas>';

    var payemtsChart = document.getElementById('myChartPayments');

    this.createMiniChart(
      payemtsChart,
      this.overviewService.transactionsVolume[this.interval].x,
      0
    );
    this.createMiniChart(
      payemtsChart,
      this.overviewService.transactionsVolume[this.interval].x,
      0
    );
  };

  updateCashChart = () => {
    var graphContainer = document.getElementsByClassName('myChart-outer')[1];
    document.getElementById('myChartCashIn').remove();
    graphContainer.innerHTML +=
      '<canvas  id="myChartCashIn" class="myChart" width="100%" height ="20px"><canvas>';
    var cashInChart = document.getElementById('myChartCashIn');
    this.createMiniChart(
      cashInChart,
      this.overviewService.generated[this.interval].x,
      1
    );
  };

  updateTransactionChart = () => {
    var graphContainer = document.getElementsByClassName('myChart-outer')[2];
    document.getElementById('myChartTransactions').remove();
    graphContainer.innerHTML +=
      '<canvas  id="myChartTransactions" class="myChart" width="100%" height ="20px"><canvas>';
    var transactionsChart = document.getElementById('myChartTransactions');
    this.createMiniChart(
      transactionsChart,
      this.overviewService.noTransactions[this.interval].x,
      2
    );
  };

  updateWithdrawChart = () => {
    var graphContainer = document.getElementsByClassName('myChart-outer')[3];
    document.getElementById('myChartWithdraw').remove();
    graphContainer.innerHTML +=
      '<canvas  id="myChartWithdraw" class="myChart" width="100%" height ="20px"><canvas>';
    var withdrawChart = document.getElementById('myChartWithdraw');
    this.createMiniChart(
      withdrawChart,
      this.overviewService.withdraw[this.interval].x,
      3
    );
  };

  updateMainGraph = () => {
    var graphContainer = document.getElementsByClassName(
      'main-graph-container'
    )[0];
    document.getElementById('mainGraph').remove();
    graphContainer.innerHTML =
      '<canvas id="mainGraph" width="200" height="55"><canvas>';

    var mainChart = document.getElementById('mainGraph');
    if (this.isLoading.length == 4)
      this.createMainChart(
        mainChart,
        this.overviewService.mainList[this.overviewService.graphMode][
          this.interval
        ].x,
        this.overviewService.mainList[this.overviewService.graphMode][
          this.interval
        ].fromDate
      );
  };

  downloadReport() {
    const options = {
      title: 'rpay-transactions',
      useKeysAsHeaders: true,
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };
    const csvExporter = new ExportToCsv(options);
    console.log(this.overviewService.transactionsVolume[this.interval]);
    csvExporter.generateCsv(
      this.overviewService.transactionsVolume[this.interval].csvData
    );
  }

  async selectTimeLine(timeLine: String) {
    console.log(timeLine);
    this.overviewService.graphTimeLines.splice(
      this.overviewService.graphTimeLines.indexOf(timeLine),
      1
    );
    this.overviewService.graphTimeLines.push(
      this.overviewService.graphTimeLine
    );
    this.overviewService.graphTimeLine = timeLine;
    if (
      this.overviewService.getDays() != 1 &&
      this.overviewService.intervalMode == 3
    ) {
      this.interval = 'daily';
      this.overviewService.intervalMode = 0;
    }
    this.loadData();
  }

  updateChartFunctions: Array<Function> = [
    this.updatePaymentGraph,
    this.updateCashChart,
    this.updateTransactionChart,
    this.updateWithdrawChart,
  ];

  selectGraphMode(modeIndex: number) {
    var temp = this.overviewService.graphMode;
    this.overviewService.graphMode = modeIndex;
    this.updateChartFunctions[modeIndex]();
    this.updateChartFunctions[temp]();
    this.updateMainGraph();
  }

  selectIntervalMode(modeIndex: number, modeType: string) {
    this.interval = modeType;
    this.overviewService.intervalMode = modeIndex;
    this.createGraph();
  }

  createMainChart(ctx: any, data: Array<Number>, scaleX: Array<String>) {
    console.log('creating main graph');
    this.graphStatus = scaleX[scaleX.length - 1]
      ? 'Last Transaction occure at ' + scaleX[scaleX.length - 1]
      : 'Transaction not occure';
    var gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 450);

    gradient.addColorStop(0, 'rgba(7, 121, 228, 0.4)');
    gradient.addColorStop(0.5, 'rgba(7, 121, 228, 0.02)');
    gradient.addColorStop(1, 'rgba(7, 121, 228, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: scaleX,
        datasets: [
          {
            label: 'Total',
            data: data,
            // fill: false,

            backgroundColor: gradient,
            borderColor: '#0779e4',
            borderWidth: 1,
            pointHitRadius: 20,
          },
        ],
      },
      options: {
        tooltips: {
          enabled: true,
        },

        responsive: true,
        elements: {
          line: {
            tension: 0,
          },
          point: {
            radius: 0,
          },
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: 'rgba(0,0,0,0.5)',
                beginAtZero: true,
              },
              gridLines: {
                color: 'rgba(0,0,0,0.05)',
                zeroLineColor: 'rgba(0,0,0,0.05)',
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                fontColor: 'rgba(0,0,0,0.5)',
              },
              gridLines: {
                color: 'rgba(0,0,0,0.05)',
                zeroLineColor: 'rgba(0,0,0,0.05)',
              },
            },
          ],
        },
      },
    });
  }

  createMiniChart(ctx: any, data: Array<Number>, modeIndex: Number) {
    var gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 450);

    if (modeIndex == this.overviewService.graphMode) {
      gradient.addColorStop(0, 'rgba(7, 121, 228, 0.05)');
      gradient.addColorStop(0.1, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(0.2, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(0.3, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(0.4, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(0.5, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(0.6, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(0.7, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(0.8, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(0.9, 'rgba(7, 121, 228, 0)');
      gradient.addColorStop(1, 'rgba(7, 121, 228, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data,
        datasets: [
          {
            label: '# of Votes',
            data: data,
            fill: true,
            backgroundColor: gradient,
            borderColor:
              modeIndex == this.overviewService.graphMode ? '#0779e4' : 'grey',
            borderWidth: 1,
          },
        ],
      },
      options: {
        animation: {
          duration: 0,
        },
        responsive: true,
        tooltips: {
          callbacks: {
            title: function (tooltipItem, data) {
              return 1;
            },
            label: function (tooltipItem, data) {
              return 1;
            },
          },
        },
        elements: {
          line: {
            tension: 0,
          },
          point: {
            radius: 0,
          },
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              ticks: {
                display: false, //this will remove only the label
              },
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                display: false, //this will remove only the label
              },
              gridLines: {
                display: false,
              },
            },
          ],
        },
      },
    });
  }

  nFormatter(num: number): String {
    var digits = 3;
    var si = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'k' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'G' },
      { value: 1e12, symbol: 'T' },
      { value: 1e15, symbol: 'P' },
      { value: 1e18, symbol: 'E' },
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
  }
}

// query from conver timestring to date
// select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') from transactions;
// select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') as date,sum(amount) as amount from transactions group by date
// select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') as date,sum(amount) as amount from transactions where isgenerated=true group by date

//select * from (select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') as date,sum(amount) as amount from transactions where to_date( Split_part(transactiontime,' ',1),'MM-DD-YYYY')>current_date-10 group by date order by date) as temp
//;

// select date_part('month',date::date),amount from (select to_date(Split_part(transactiontime,' ' ,1),'MM-DD-YYYY') as date,sum(amount) as amount from transactions where to_date( Split_part(transactiontime,' ',1),'MM-DD-YYYY')
//>= current_date - 10 group by date order by date) as temp
//;

// select min(date), date_part('month', date:: date) as time, sum(amount) from(select to_date(Split_part(transactiontime, ' ', 1), 'MM-DD-YYYY') as date, sum(amount) as amount from transactions where to_date(Split_part(transactiont
// ime, ' ', 1), 'MM-DD-YYYY') >= current_date - 10 group by date order by date) as temp group by time;
