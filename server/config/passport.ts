import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
import { config } from "./env.js";
import { isDbConnected } from "./db.js";
import { User } from "../models/User.model.js";

// Google Strategy
if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: `${config.appUrl}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found from Google profile"), undefined);
          }

          if (isDbConnected()) {
            let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
            if (user) {
              if (!user.googleId) {
                user.googleId = profile.id;
                user.provider = "multiple";
                await user.save();
              }
              return done(null, user);
            }

            const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "";
            user = await User.create({
              username: profile.displayName || email.split("@")[0],
              email,
              googleId: profile.id,
              provider: "google",
              avatarUrl,
            });

            return done(null, user);
          }

          // Fallback object if DB offline
          const mockUser = {
            _id: "google_" + profile.id,
            id: "google_" + profile.id,
            username: profile.displayName || email.split("@")[0],
            email,
            avatarUrl: profile.photos?.[0]?.value || "",
            history: [],
          };
          return done(null, mockUser as any);
        } catch (err: any) {
          return done(err, undefined);
        }
      }
    )
  );
}

// Discord Strategy
if (config.discord.clientId && config.discord.clientSecret) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: config.discord.clientId,
        clientSecret: config.discord.clientSecret,
        callbackURL: `${config.appUrl}/api/auth/discord/callback`,
        scope: ["identify", "email"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.email;
          if (!email) {
            return done(new Error("No email found from Discord profile"), undefined);
          }

          let avatarUrl = "";
          if (profile.avatar) {
            const format = profile.avatar.startsWith("a_") ? "gif" : "png";
            avatarUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
          }

          if (isDbConnected()) {
            let user = await User.findOne({ $or: [{ discordId: profile.id }, { email }] });
            if (user) {
              if (!user.discordId) {
                user.discordId = profile.id;
                user.provider = "multiple";
                await user.save();
              }
              return done(null, user);
            }

            user = await User.create({
              username: profile.username || email.split("@")[0],
              email,
              discordId: profile.id,
              provider: "discord",
              avatarUrl,
            });

            return done(null, user);
          }

          const mockUser = {
            _id: "discord_" + profile.id,
            id: "discord_" + profile.id,
            username: profile.username || email.split("@")[0],
            email,
            avatarUrl,
            history: [],
          };
          return done(null, mockUser as any);
        } catch (err: any) {
          return done(err, undefined);
        }
      }
    )
  );
}

export default passport;
