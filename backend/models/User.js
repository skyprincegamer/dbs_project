const conn = require('../db/instance');
class UserModel {
    constructor(data) {
        this.id = data?.id;
        this.username = data?.username;
        this.email = data?.email;
        this.passwordHash = data?.passwordHash;
        this.active = data?.active;
    }
    static findOne(query) {
        var querParamString = "";
        for (const key in query) {
            if (querParamString !== "") {
                querParamString += " AND ";
            }
            querParamString += `${key} = '${(query[key]===true || query[key]===false) ? Number(query[key]) : query[key]}'`;
        }
        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM users WHERE ${querParamString} LIMIT 1`, (err, result) => {
                if (err) {
                    resolve(err);
                } else {
                    resolve(result.length>0 ? new UserModel(result[0]) : null);
                }
            });
        });
    }
    static findById(id) {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM users WHERE id = '${id}' LIMIT 1`, (err, result) => {
                if (err) {
                    throw err;
                } else {
                    resolve(result.length>0 ? new UserModel(result[0]) : null);
                }
            });
        });
    }
    save() {
        const userData = this;
        var queryParamString = "(";
        for (const key in userData) {
            if (queryParamString !== "(") {
                queryParamString += ", ";
            }
            queryParamString += `${key}`;
        }
        queryParamString += ") VALUES (";
        for (const key in userData) {
            if (queryParamString.slice(-2) !== " (") {
                queryParamString += ", ";
            }
            queryParamString += `'${(userData[key]===true)? 1 : userData[key]}'`;
        }
        queryParamString += ")";
        return new Promise((resolve, reject) => {
            conn.query(`INSERT INTO users ${queryParamString}`, userData, (err, result) => {
                if (err) {
                    throw err;
                } else {
                    resolve(result);
                }
            });
        });
    }
};
module.exports = UserModel;