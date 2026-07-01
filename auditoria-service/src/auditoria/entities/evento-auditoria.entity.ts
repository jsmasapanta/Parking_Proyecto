import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AccionAuditoria {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  TICKET_CREADO = 'TICKET_CREADO',
  TICKET_PAGADO = 'TICKET_PAGADO',
  TICKET_ANULADO = 'TICKET_ANULADO',
  PERSONA_CREADA = 'PERSONA_CREADA',
  PERSONA_ACTUALIZADA = 'PERSONA_ACTUALIZADA',
  PERSONA_ELIMINADA = 'PERSONA_ELIMINADA',
  ROL_ASIGNADO = 'ROL_ASIGNADO',
  VEHICULO_CREADO = 'VEHICULO_CREADO',
  OTRO = 'OTRO',
}

@Entity({ name: 'eventos_auditoria' })
export class EventoAuditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  servicio: string;

  @Column({ type: 'enum', enum: AccionAuditoria, default: AccionAuditoria.OTRO })
  accion: AccionAuditoria;

  @Column({ type: 'varchar', length: 100, name: 'usuario_id', nullable: true })
  usuarioId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  datos: Record<string, any> | null;

  @Column({ type: 'timestamptz', name: 'timestamp_evento' })
  timestampEvento: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
