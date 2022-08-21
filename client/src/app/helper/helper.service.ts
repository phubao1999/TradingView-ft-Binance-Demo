import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
// @ts-ignore
import { api } from '@marcius-capital/binance-api';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  readonly intervals = {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    '240': '4h',
    '360': '6h',
    '480': '8h',
    '720': '12h',
    D: '1d',
    '1D': '1d',
    '3D': '3d',
    W: '1w',
    '1W': '1w',
    M: '1M',
    '1M': '1M',
  };
  readonly baseApi = environment.baseApi;

  constructor(private http: HttpClient) {}

  getExchangeServerTime(): Observable<any> {
    return this.requestBE('time').pipe(
      map((res) => {
        if (res) {
          return res.serverTime;
        }
      })
    );
  }

  getSymbols(): Observable<any> {
    return this.requestBE('exchangeInfo').pipe(map((res) => res.symbols));
  }

  getKlines = ({ symbol, interval, from, to }: any) => {
    interval = '1M';

    from *= 1000;
    to *= 1000;

    return this.requestBE('/klines', {
      symbol: symbol.toUpperCase(),
      interval,
      startTime: from,
      endTime: to,
    }).pipe(
      map((res) => {
        return res.map((i: any) => {
          return {
            time: parseFloat(i[0]),
            open: parseFloat(i[1]),
            high: parseFloat(i[2]),
            low: parseFloat(i[3]),
            close: parseFloat(i[4]),
            volume: parseFloat(i[5]),
          };
        });
      })
    );
  };

  subscribeKline = (
    { symbol, interval, uniqueID }: any,
    callback: Function
  ) => {
    interval = '1M';
    return api.stream.kline({ symbol, interval, uniqueID }, (res: any) => {
      const candle = this.formatingKline(res.kline);
      callback(candle);
    });
  };

  unsubscribeKline = (uniqueID: any) => {
    return api.stream.close.kline({ uniqueID });
  };

  checkInterval = (interval: any) => !!'1M';

  requestBE(url: string, params = {}): Observable<any> {
    const baseUrl = `${this.baseApi}/${url}`;
    return this.http.get(baseUrl, params).pipe(map((res: any) => res.data));
  }

  generateSymbol(exchange: any, fromSymbol: any, toSymbol: any) {
    const short = `${fromSymbol}/${toSymbol}`;
    return {
      short,
      full: `${exchange}:${short}`,
    };
  }

  private formatingKline({ openTime, open, high, low, close, volume }: any) {
    return {
      time: openTime,
      open,
      high,
      low,
      close,
      volume,
    };
  }
}
