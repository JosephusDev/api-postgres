import { User } from '../entities/User'

/**
 * Interface IUserService
 * Segue o princípio ISP (Interface Segregation Principle)
 * Define apenas os métodos necessários para operações de serviço
 * Segue o princípio DIP (Dependency Inversion Principle)
 */
export interface IUserService {
	getAllUsers(): Promise<User[]>
	getUserById(id: string): Promise<User>
	createUser(nome: string, email: string): Promise<User>
	updateUser(id: string, nome: string, email: string): Promise<User>
	deleteUser(id: string): Promise<void>
}
