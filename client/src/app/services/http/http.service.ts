import { Injectable } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { HelperService } from 'src/app/helper/helper.service';

@Injectable()
export class HttpService {
  readonly configurationData = {
    supports_marks: false,
    supports_timescale_marks: false,
    supports_time: true,
    supported_resolutions: [
      '1',
      '3',
      '5',
      '15',
      '30',
      '60',
      '120',
      '240',
      '1D',
      '3D',
      '1W',
      '1M',
    ],
    exchanges: [
      {
        value: 'Bitfinex',
        name: 'Bitfinex',
        desc: 'Bitfinex',
      },
      {
        value: 'Kraken',
        name: 'Kraken',
        desc: 'Kraken bitcoin exchange',
      },
    ],
    symbols_types: [
      {
        name: 'crypto',
        value: 'crypto',
      },
    ],
  };
  constructor(private helperService: HelperService) {}

  getDataFeed() {
    return {
      searchSymbols: () => {},
      onReady: (callback: Function) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(this.configurationData));
      },
      resolveSymbol: (
        symbolName: string,
        onSymbolResolvedCallback: Function,
        onResolveErrorCallback: Function
      ) => {
        console.log('[resolveSymbol]: Method call', symbolName);

        const comps = symbolName.split(':');
        symbolName = (comps.length > 1 ? comps[1] : symbolName).toUpperCase();

        const symbolInfo = (symbol: any) => ({
          name: symbol.symbol,
          description: symbol.baseAsset + ' / ' + symbol.quoteAsset,
          ticker: symbol.symbol,
          //exchange: 'Binance',
          //listed_exchange: 'Binance',
          //type: 'crypto',
          session: '24x7',
          minmov: 1,
          pricescale: this.pricescale(symbol),
          timezone: 'UTC',
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          currency_code: symbol.quoteAsset,
        });

        // Get symbols
        this.helperService.getSymbols().pipe(
          map((symbols) => {
            const symbol = symbols.find((i: any) => i.symbol == symbolName);
            return symbol
              ? onSymbolResolvedCallback(symbolInfo(symbol))
              : onResolveErrorCallback('[resolveSymbol]: symbol not found');
          })
        );
      },
      getBars: async (
        symbolInfo: any,
        interval: any,
        periodParams: any,
        onHistoryCallback: Function,
        onErrorCallback: Function
      ) => {
        console.log('[getBars] Method call', symbolInfo, interval);

        if (!this.helperService.checkInterval(interval)) {
          return onErrorCallback('[getBars] Invalid interval');
        }

        const klines = await lastValueFrom(
          this.helperService.getKlines({
            symbol: symbolInfo.name,
            interval,
            from: periodParams.from,
            to: periodParams.to,
          })
        );
        if (klines.length > 0) {
          return onHistoryCallback(klines);
        }

        onErrorCallback('Klines data error');
      },
      subscribeBars: (
        symbolInfo: any,
        interval: any,
        onRealtimeCallback: Function,
        subscribeUID: any
      ) => {
        console.log(
          '[subscribeBars]: Method call with subscribeUID:',
          subscribeUID
        );

        this.helperService.subscribeKline(
          { symbol: symbolInfo.name, interval, uniqueID: subscribeUID },
          (cb: Function) => onRealtimeCallback(cb)
        );
      },
      unsubscribeBars: (subscriberUID: any) => {
        console.log(
          '[unsubscribeBars]: Method call with subscriberUID:',
          subscriberUID
        );
        this.helperService.unsubscribeKline(subscriberUID);
      },
      getServerTime: (callback: Function) => {
        this.helperService.getExchangeServerTime().subscribe(
          (time) => {
            callback(Math.floor(time / 1000));
          },
          (err) => {
            console.log(err);
          }
        );
      },
    };
  }

  private pricescale(symbol: any) {
    for (let filter of symbol.filters) {
      if (filter.filterType == 'PRICE_FILTER') {
        return Math.round(1 / parseFloat(filter.tickSize));
      }
    }
    return 1;
  }
}
