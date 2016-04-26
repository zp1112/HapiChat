import mysql from './mysql';
import { format } from 'mysql';
import { isEmpty } from '../../lib/common';

exports.getUser = async(username) => {
  const client = await mysql();
  const sql = format('SELECT password FROM candy.users WHERE username=?', username);
  const row = await client.query(sql);
  if (isEmpty(row)) {
    client.release();
    return -1;
  }
  return row[0].password;
};

exports.registerUser = async(username, password) => {
  const client = await mysql();
  const sql = format('SELECT password FROM candy.users WHERE username=?', username);
  const row = await client.query(sql);
  if (!isEmpty(row)) {
    client.release();
    return -1;
  }
  const sql2 = format('INSERT INTO candy.users SET username = ?, password = ?', [username, password]);
  const result = await client.query(sql2);
  return isEmpty(result) ? -1 : result.affectedRows;
};
