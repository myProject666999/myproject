const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { ValidationError, UnauthorizedError } = require("../middleware/errorHandler");

async function register(req, res, next) {
  try {
    const { username, password, nickname, email, phone } = req.body;

    if (!username || !password) {
      return next(new ValidationError("用户名和密码不能为空"));
    }
    if (username.length < 3 || username.length > 50) {
      return next(new ValidationError("用户名长度应为3-50个字符"));
    }
    if (password.length < 6) {
      return next(new ValidationError("密码长度不能少于6位"));
    }

    const [existing] = await pool.query(
      `SELECT id FROM users WHERE username = ?`,
      [username]
    );
    if (existing.length > 0) {
      return next(new ValidationError("用户名已存在"));
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, nickname, email, phone) VALUES (?, ?, ?, ?, ?)`,
      [username, passwordHash, nickname || "", email || "", phone || ""]
    );

    const token = jwt.sign(
      { id: result.insertId, username },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      success: true,
      data: {
        user: { id: result.insertId, username, nickname: nickname || "" },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new ValidationError("用户名和密码不能为空"));
    }

    const [users] = await pool.query(
      `SELECT id, username, password_hash, nickname, avatar_url FROM users WHERE username = ? AND is_active = 1`,
      [username]
    );
    if (users.length === 0) {
      return next(new ValidationError("用户名或密码错误"));
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return next(new ValidationError("用户名或密码错误"));
    }

    await pool.query(
      `UPDATE users SET last_login_at = NOW() WHERE id = ?`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const [users] = await pool.query(
      `SELECT id, username, nickname, email, phone, avatar_url, last_login_at, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (users.length === 0) {
      return next(new UnauthorizedError("用户不存在"));
    }

    res.json({ success: true, data: users[0] });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { nickname, email, phone } = req.body;

    await pool.query(
      `UPDATE users SET nickname = ?, email = ?, phone = ? WHERE id = ?`,
      [nickname || "", email || "", phone || "", req.user.id]
    );

    res.json({ success: true, message: "更新成功" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
