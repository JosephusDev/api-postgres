import { User } from '../entities/User'

/**
 * Interface IUserRepository
 * Segue o princípio ISP (Interface Segregation Principle)
 * Define apenas os métodos necessários para operações de repositório
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Permite que classes de alto nível dependam de abstrações
 */
export interface IUserRepository {
	findAll(): Promise<User[]>
	findById(id: string): Promise<User | null>
	findByEmail(email: string): Promise<User | null>
	create(User: User): Promise<User>
	update(id: string, User: Partial<User>): Promise<User>
	delete(id: string): Promise<void>
}
