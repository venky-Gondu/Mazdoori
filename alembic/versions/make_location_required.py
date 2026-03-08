"""Make latitude and longitude required

Revision ID: make_location_required
Revises: 66f25523f683
Create Date: 2026-01-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'make_location_required'
down_revision = '66f25523f683'
branch_labels = None
depends_on = None


def upgrade():
    # Step 1: Update existing NULL values to a default location (optional - can skip if no data)
    # Using Hyderabad, India as default location for existing users
    op.execute("""
        UPDATE users 
        SET latitude = 17.385044, longitude = 78.486671 
        WHERE latitude IS NULL OR longitude IS NULL
    """)
    
    # Step 2: Remove the unused 'location' column
    op.drop_column('users', 'location')
    
    # Step 3: Make latitude and longitude NOT NULL
    op.alter_column('users', 'latitude',
               existing_type=sa.Float(),
               nullable=False)
    op.alter_column('users', 'longitude',
               existing_type=sa.Float(),
               nullable=False)


def downgrade():
    # Reverse the changes
    op.alter_column('users', 'latitude',
               existing_type=sa.Float(),
               nullable=True)
    op.alter_column('users', 'longitude',
               existing_type=sa.Float(),
               nullable=True)
    
    # Add back the location column
    op.add_column('users', sa.Column('location', sa.String(), nullable=True))
