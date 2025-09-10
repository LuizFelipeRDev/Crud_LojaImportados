import bcrypt from "bcryptjs";

export async function POST(req, res) {
  const { password } = await req.json();
  const hash = "$2a$10$ExemploDeHash...";

  if (bcrypt.compareSync(password, hash)) {
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
}
