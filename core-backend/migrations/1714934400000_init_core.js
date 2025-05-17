exports.up = (pgm) => {
    // Enum para roles
    pgm.createType('core.role', ['ADMIN', 'SUPERUSER', 'USER']);
    
    // Tabela User
    pgm.createTable('core.user', {
      id: 'id',
      email: { type: 'text', unique: true, notNull: true },
      password: { type: 'text', notNull: true },
      name: { type: 'text', notNull: true },
      role: { type: 'core.role', notNull: true, default: 'USER' },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
    
    // Tabela Company
    pgm.createTable('core.company', {
      id: 'id',
      name: { type: 'text', notNull: true },
      address: { type: 'text' },
      code: { type: 'integer', unique: true, notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
    
    // Tabela CompanyGroup
    pgm.createTable('core.company_group', {
      id: 'id',
      name: { type: 'text', notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
    
    // Tabela UserCompany
    pgm.createTable('core.user_company', {
      id: 'id',
      user_id: { type: 'integer', notNull: true },
      company_id: { type: 'integer', notNull: true },
      is_default: { type: 'boolean', notNull: true, default: false }
    });
    
    // Tabela _CompanyToCompanyGroup (relação many-to-many)
    pgm.createTable('core.company_to_company_group', {
      A: { type: 'integer', notNull: true },
      B: { type: 'integer', notNull: true }
    });
    
    // Constraints e índices
    pgm.addConstraint('core.user_company', 'fk_user_company_user', {
      foreignKeys: {
        columns: 'user_id',
        references: 'core.user(id)',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      }
    });
    
    pgm.addConstraint('core.user_company', 'fk_user_company_company', {
      foreignKeys: {
        columns: 'company_id',
        references: 'core.company(id)',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      }
    });
    
    pgm.addConstraint('core.company_to_company_group', 'fk_company_group_company', {
      foreignKeys: {
        columns: 'A',
        references: 'core.company(id)',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });
    
    pgm.addConstraint('core.company_to_company_group', 'fk_company_group_group', {
      foreignKeys: {
        columns: 'B',
        references: 'core.company_group(id)',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });
    
    pgm.addIndex('core.company_to_company_group', 'B');
    pgm.addIndex('core.user_company', ['user_id', 'company_id'], { unique: true });
  };
  
  exports.down = (pgm) => {
    pgm.dropTable('core.company_to_company_group');
    pgm.dropTable('core.user_company');
    pgm.dropTable('core.company_group');
    pgm.dropTable('core.company');
    pgm.dropTable('core.user');
    pgm.dropType('core.role');
  };