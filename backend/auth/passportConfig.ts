import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function initialize() {
  // Passport configuration
  passport.use(
    new LocalStrategy(async (email, password, done) => {
      try {
        // Find user by username
        const user = await prisma.user.findUnique({
          where: {
            email: email, 
          },
        });  
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        
        // Check if password matches
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: 'Incorrect password' });
        }
  
        // If everything matches, return the user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
          where: {
            id: id, 
          },
        });  
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
