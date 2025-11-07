#!/usr/bin/env python3
"""
Generate a secure random secret key for Flask
Run this and copy the output to your .env file
"""
import secrets

print("=" * 60)
print("🔐 Flask Secret Key Generator")
print("=" * 60)
print("\nGenerated Secret Key (copy this):")
print("\nSECRET_KEY=" + secrets.token_hex(32))
print("\n" + "=" * 60)
print("Add this to your Render environment variables!")
print("=" * 60)
