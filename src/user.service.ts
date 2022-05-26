import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { IUserService, UserCreateDTO } from "nestjs-simple-auth";

/** *************************************************
 * EXCEPTIONS
 ****************************************************/

class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
  }
}

class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid Credentials");
  }
}

/** *************************************************
 * SERVICE
 ****************************************************/

type SanitizedUser = Exclude<User, "password">;

/**
 * Sanitize user object
 * - Removed password field
 * @param user
 * @returns user object without password property set as undefined
 */
function sanitizeUser<T>(user: T): Exclude<T, "password"> {
  // eslint-disable-next-line no-param-reassign
  if ((user as any)?.password) (user as any).password = undefined;
  return user as any;
}

interface JwtPayload {
  sub: number;
  username?: string;
  mobile?: string;
}

@Injectable()
export class UserService implements IUserService<SanitizedUser> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  /**
   * Returns the User after validating the username and password
   * @param userDTO
   * @returns User
   */
  async findByUsernamePassword(
    username: string,
    password: string
  ): Promise<SanitizedUser> {
    const user = await this.userRepository.findOne({ username });

    if (!user) {
      throw new UserNotFoundError();
    }

    const isPasswordMatches = await compare(password, user.password);
    if (!isPasswordMatches) {
      throw new InvalidCredentialsError();
    }

    const data = sanitizeUser(user);
    return data;
  }

  /**
   * Create a new User
   * @param userData
   * @returns
   */
  async createUser(userData: UserCreateDTO): Promise<SanitizedUser> {
    // Validate data : We should atleast have (username, password) or (mobile no)
    let isValid = false;
    if (!!userData.password && !!userData.password) {
      // CHeck if username already exists
      const existingUser = await this.userRepository.findOne({
        username: userData.username,
      });
      console.log(existingUser);
      if (!existingUser) isValid = true;
    } else if (!!userData.mobile) {
      // Check if mobile number exists
      const existingUser = await this.userRepository.findOne({
        mobile: userData.mobile,
      });
      if (!existingUser) isValid = true;
    }

    if (!isValid) {
      throw new Error(
        "User should atleast contain valid username, passwrod or mobile number"
      );
    }

    // Hash password
    const password = await hash(userData.password, 10);

    const user = this.userRepository.create({
      username: userData.username,
      password,
      mobile: userData.mobile,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    });

    await this.userRepository.save(user);

    return sanitizeUser(user);
  }

  async findUserById(userId: any): Promise<User> {
    const user = await this.userRepository.findOne({ id: userId });
    return sanitizeUser(user);
  }

  getJwtTokenPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      username: user.username,
      mobile: user.mobile,
    };
  }

  async validateJwtPayload(payload: JwtPayload) {
    return this.findUserById(payload.sub);
  }
}
