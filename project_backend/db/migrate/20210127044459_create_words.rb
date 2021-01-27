class CreateWords < ActiveRecord::Migration[6.1]
  def change
    create_table :words do |t|
      t.string :name
      t.integer :difficulty
      t.string :url
      t.string :definition

      t.timestamps
    end
  end
end
