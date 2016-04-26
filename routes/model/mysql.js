import mysql from 'mysql';
import { getDefer, logger } from '../../lib/common';

const mysqlOptions = {
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'root'
};

const ignoreMysqlErrors = [1062];

const pool = mysql.createPool(mysqlOptions);

const getConn = (retry) => {
  const deferred = getDefer();
  pool.getConnection((err, cn) => {
    if (err) {
      if (!retry) {
        deferred.resolve(getConn(true));
      } else {
        deferred.reject(err);
      }
    }
    deferred.resolve(cn);
  });
  return deferred.promise;
};

module.exports = async() => {
  const result = {};
  try {
    const cn = await getConn();
    result.query = (sql) => {
      // console.log(sql);
      const deferred = getDefer();
      cn.query(sql, (err, rows) => {
        if (err) {
          if (ignoreMysqlErrors.indexOf(err.errno) === -1) {
            logger(sql, err.message);
          }
          deferred.resolve({});
        }
        deferred.resolve(rows);
      });
      return deferred.promise;
    };
    result.release = () => {
      cn.release();
    };
  } catch (err) {
    result.query = () => null;
    result.release = () => null;
  }
  return result;
};
