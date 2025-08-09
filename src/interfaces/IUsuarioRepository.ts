import { Usuario } from '../entities/Usuario'

/**
 * Interface IUsuarioRepository
 * Segue o princípio ISP (Interface Segregation Principle)
 * Define apenas os métodos necessários para operações de repositório
 * Segue o princípio DIP (Dependency Inversion Principle)
 * Permite que classes de alto nível dependam de abstrações
 */
export interface IUsuarioRepository {
	findAll(): Promise<Usuario[]>
	findById(id: string): Promise<Usuario | null>
	findByEmail(email: string): Promise<Usuario | null>
	create(usuario: Usuario): Promise<Usuario>
	update(id: string, usuario: Partial<Usuario>): Promise<Usuario>
	delete(id: string): Promise<void>
}
