exports.up = (pgm) => {
    // Tabela FinancialAccount
    pgm.createTable('zenit.financial_account', {
      id: 'id',
      name: { type: 'text', notNull: true },
      type: { type: 'text', notNull: true },
      balance: { type: 'decimal', notNull: true, default: 0 },
      account_number: { type: 'text' },
      bank_name: { type: 'text' },
      is_active: { type: 'boolean', notNull: true, default: true },
      company_id: { type: 'integer', notNull: true },
      user_id: { type: 'integer', notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
    
    // Tabela FinancialCategory
    pgm.createTable('zenit.financial_category', {
      id: 'id',
      name: { type: 'text', notNull: true },
      type: { type: 'text', notNull: true },
      color: { type: 'text' },
      company_id: { type: 'integer', notNull: true }
    });
    
    // Tabela FinancialTransaction
    pgm.createTable('zenit.financial_transaction', {
      id: 'id',
      description: { type: 'text', notNull: true },
      amount: { type: 'decimal', notNull: true },
      date: { type: 'timestamp', notNull: true },
      type: { type: 'text', notNull: true },
      status: { type: 'text', notNull: true },
      notes: { type: 'text' },
      account_id: { type: 'integer', notNull: true },
      category_id: { type: 'integer' },
      company_id: { type: 'integer', notNull: true },
      user_id: { type: 'integer', notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
    
    // Tabela FinancialAccountingPlan
    pgm.createTable('zenit.financial_accounting_plan', {
      id: 'id',
      code: { type: 'text', notNull: true },
      name: { type: 'text', notNull: true },
      type: { type: 'text', notNull: true },
      company_id: { type: 'integer', notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });
    
    // Constraints
    pgm.addConstraint('zenit.financial_account', 'fk_financial_account_company', {
      foreignKeys: {
        columns: 'company_id',
        references: 'core.company(id)'
      }
    });
    
    pgm.addConstraint('zenit.financial_account', 'fk_financial_account_user', {
      foreignKeys: {
        columns: 'user_id',
        references: 'core.user(id)'
      }
    });
    
    pgm.addConstraint('zenit.financial_category', 'fk_financial_category_company', {
      foreignKeys: {
        columns: 'company_id',
        references: 'core.company(id)'
      }
    });
    
    pgm.addConstraint('zenit.financial_transaction', 'fk_financial_transaction_account', {
      foreignKeys: {
        columns: 'account_id',
        references: 'zenit.financial_account(id)'
      }
    });
    
    pgm.addConstraint('zenit.financial_transaction', 'fk_financial_transaction_category', {
      foreignKeys: {
        columns: 'category_id',
        references: 'zenit.financial_category(id)'
      }
    });
    
    pgm.addConstraint('zenit.financial_transaction', 'fk_financial_transaction_company', {
      foreignKeys: {
        columns: 'company_id',
        references: 'core.company(id)'
      }
    });
    
    pgm.addConstraint('zenit.financial_transaction', 'fk_financial_transaction_user', {
      foreignKeys: {
        columns: 'user_id',
        references: 'core.user(id)'
      }
    });
    
    pgm.addConstraint('zenit.financial_accounting_plan', 'fk_financial_accounting_plan_company', {
      foreignKeys: {
        columns: 'company_id',
        references: 'core.company(id)'
      }
    });
  };
  
  exports.down = (pgm) => {
    pgm.dropTable('zenit.financial_accounting_plan');
    pgm.dropTable('zenit.financial_transaction');
    pgm.dropTable('zenit.financial_category');
    pgm.dropTable('zenit.financial_account');
  };