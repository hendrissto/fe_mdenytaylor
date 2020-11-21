import Axios from "axios";
import { Observable } from "rxjs";

export class HttpClientAxiosService {
  cancelToken = Axios.CancelToken;
  axios = new Axios();

  constructor(axios) {
    this.axios = axios;
  }

  post(url = "", data, config = {}) {
    return Observable.create(observer => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      this.axios
        .post(url, data, config)
        .catch(error => {
          observer.error(error.response);
        })
        .then(response => {
          if (response) {
            observer.next(response.data);
          }
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
        observer.complete();
      };
    });
  }

  put(url = "", data, config = {}) {
    return Observable.create(observer => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      this.axios
        .put(url, data, config)
        .catch(error => {
          observer.error(error.response);
        })
        .then(response => {
          if (response) {
            observer.next(response.data);
          }
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
        observer.complete();
      };
    });
  }

  patch(url = "", data, config = {}) {
    return Observable.create(observer => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      this.axios
        .patch(url, data, config)
        .catch(error => {
          observer.error(error.response);
        })
        .then(response => {
          if (response) {
            observer.next(response.data);
          }
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
        observer.complete();
      };
    });
  }

  get(url = "", config = {}) {
    return Observable.create(observer => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      this.axios
        .get(url, config)
        .catch(error => {
          observer.error(error);
        })
        .then(response => {
          if (response) {
            observer.next(response.data);
          }
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
        observer.complete();
      };
    });
  }

  delete(url = "", config = {}) {
    return Observable.create(observer => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      this.axios
        .delete(url, config)
        .catch(error => {
          observer.error(error.response);
        })
        .then(response => {
          if (response) {
            observer.next(response.data);
          }
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
        observer.complete();
      };
    });
  }
}
