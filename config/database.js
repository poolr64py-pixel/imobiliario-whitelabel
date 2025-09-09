module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: './data/data.db',
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  }
});