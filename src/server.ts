import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const port = 4444;

const SECRET = process.env.SECRET!;

const API = `http://localhost:${port}`;

function hash(password: string) {
  return bcrypt.hashSync(password, 12);
}

function verify(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

function generateToken(id: number) {
  return jwt.sign({ id }, SECRET);
}

async function getCurrentUser(token = "") {
  try {
    const data = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({
      where: { id: (data as any).id },
      include: {
        groups: { include: { messages: true } },
      },
    });
    return user;
  } catch (error) {
    //@ts-ignore
    return null;
  }
}

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.send(users);
});

//Don't create two different accounts with the same email
app.post("/sign-up", async (req, res) => {
  const { email, username,fullname, publicAccount, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    const errors: string[] = [];

    if (typeof email !== "string") {
      errors.push("Email not provided or not a string");
    }

    if (typeof fullname !== "string") {
      errors.push("Fullname not provided or not a string");
    }

    if (typeof password !== "string") {
      errors.push("Password not provided or not a string");
    }

    if (errors.length > 0) {
      res.status(400).send({ errors });
      return;
    }

    if (existingUser) {
      return res.status(400).send({ errors: ["Email already exists!"] });
    }
    const user = await prisma.user.create({
      data: { email, fullname, publicAccount, password: hash(password) },
    });
    const token = generateToken(user.id);
    res.send({ user, token });
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});


app.post("/groups", async (req, res) => {
  try {
    const newgroup = await prisma.group.create({
      data: {
        users: {
          connect: req.body.users.map((useremail: string) => ({
            email: useremail,
          })),
        },
        name: req.body.name,
        public: req.body.public,
        role: req.body.role
      },
    });
    res.send(newgroup);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.patch("/groups/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const newgroup = await prisma.group.update({
      where: { id },
      data: {
        users: {
          connect: req.body.users.map((useremail: string) => ({
            email: useremail,
          })),
        },
        name: req.body.name,
        public: req.body.public,
        role: req.body.role
      },
    });
    res.send(newgroup);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.delete("/groups/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.group.delete({
      where: { id },
    });
    res.send({ messaage: "Group deleted successfully" });
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/groups", async (req, res) => {
  try {
    const allGroups = await prisma.group.findMany({
      include: {
        messages: {
          include: {
            sender: {
              select: {
                email: true,
                fullname: true,
              },
            },
          },
        },
        users: {
          select: {
            email: true,
            fullname: true,
          },
        },
      },
    });
    res.send(allGroups);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});


app.post("/sign-in", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const errors: string[] = [];

    if (typeof email !== "string") {
      errors.push("Email not provided or not a string");
    }
    if (typeof password !== "string") {
      errors.push("Password not provided or not a string");
    }

    if (errors.length > 0) {
      res.status(400).send({ errors });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user && verify(password, user.password)) {
      const token = generateToken(user.id);
      res.send({ user, token });
    } else {
      res.status(400).send({
        errors: ["Please make sure you are using the right credentials!"],
      });
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

app.get("/validate", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const user = await getCurrentUser(token);
      if (user) {
        const newToken = generateToken(user.id);
        res.send({ user, token: newToken });
      } else {
        res.status(400).send({ errors: ["Token is invalid!"] });
      }
    } else {
      res.status(400).send({ errors: ["Token not provided!"] });
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ errors: [error.message] });
  }
});

app.listen(port, () => {
  console.log(`App is running: ${API}`);
});
