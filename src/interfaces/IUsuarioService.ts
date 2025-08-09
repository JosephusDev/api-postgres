import { Usuario } from '../entities/Usuario'

/**
 * Interface IUsuarioService
 * Segue o princípio ISP (Interface Segregation Principle)
 * Define apenas os métodos necessários para operações de serviço
 * Segue o princípio DIP (Dependency Inversion Principle)
 */
export interface IUsuarioService {
	getAllUsuarios(): Promise<Usuario[]>
	getUsuarioById(id: string): Promise<Usuario>
	createUsuario(nome: string, email: string): Promise<Usuario>
	updateUsuario(id: string, nome: string, email: string): Promise<Usuario>
	deleteUsuario(id: string): Promise<void>
}
