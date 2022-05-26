import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({
  name: "user",
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  mobile?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  lastLogin?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
