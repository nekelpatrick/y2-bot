import { Input } from "telegraf";
import { wavDownloader } from "./wav-downloader";
import fs from "fs";

const { Telegraf } = require("telegraf");

const express = require("express");
const expressApp = express();
const axios = require("axios");
const path = require("path");
const port = process.env.PORT || 3000;
require("dotenv").config();

expressApp.use(express.static("static"));
expressApp.use(express.json());

const { message } = require("telegraf/filters");

const bot = new Telegraf(process.env.BOT_TOKEN);

expressApp.get("/", (req: any, res: any) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

// bot.use((ctx: any, next: any) => {
//   logger();
//   if (!ctx.session.commandInProgress) {
//     ctx.reply(`
//    Aqui estão todos os comandos disponíveis:
//    - /start: Inicia o bot
//    - /baixarMusicas: Baixar músicas a partir de URLs do YouTube
//    `);
//   }
//   return next(ctx);
// });

bot.start((ctx: any) => ctx.reply("Welcome"));

bot.command("baixarMusicas", (ctx: any) => {
  ctx.reply(`Mande um ou vários links do YouTube.`);
  bot.on("message", async (ctx: any) => {
    try {
      logger();
      await ctx.reply(`Validando URL's...`);
      await wavDownloader(ctx.message.text, ctx);
      await ctx.reply(`Músicas processadas.`);
      await ctx.reply("👍");
      ctx.reply(`
   Baixar mais músicas?
   - /baixarMusicas: Baixar músicas a partir de URLs do YouTube
        `);
    } catch (error) {
      await ctx.reply("👎");
      console.error(`Ocorreu um erro: ${error}`);
      ctx.reply(`
   Tentar novamente:
   - /baixarMusicas: Baixar músicas a partir de URLs do YouTube
        `);
    }
  });
});

bot.command("iniciar", (ctx: any) => {
  logger();
  bot.telegram.sendMessage(ctx.chat.id, "Olá. Vamos começar.");
  ctx.reply(`
    Aqui estão todos os comandos disponíveis:
    - /baixarMusicas: Baixar músicas a partir de URLs do YouTube
  `);
});

bot.hears("👋", (ctx: any) => ctx.reply("👋"));

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// bot.command("anna", (ctx: any) => {
//   console.log(ctx.from);
//   ctx.reply(`Te amo infinito,`);
//   bot.hears("Igual", (ctx: any) => ctx.reply("E pra toooodo sempre"));
//   bot.hears("=", (ctx: any) => ctx.reply("E pra toooodo sempre"));
//   bot.hears("igual", (ctx: any) => ctx.reply("E pra toooodo sempre"));
// });

async function logger() {
  bot.on("message", (ctx: any) => {
    if (ctx.message.text) {
      console.log(
        `usuário: ${ctx.message.from.first_name}\nMensagem: ${ctx.message.text}`
      );
    } else if (ctx.message.audio) {
      console.log(
        `usuário: ${ctx.message.from.first_name}\nAudio recebido: ${ctx.message.audio.file_id}`
      );
    } else if (ctx.message.document) {
      console.log(
        `usuário: ${ctx.message.from.first_name}\nDocumento recebido: ${ctx.message.document.file_id}`
      );
    } else if (ctx.message.photo) {
      console.log(
        `usuário: ${
          ctx.message.from.first_name
        }\nDocumento recebido: ${JSON.stringify(ctx.message.photo)}`
      );
    }
  });
}
