class TestVarint {
    // Hex print helper
    final protected static char[] hexArray = "0123456789ABCDEF".toCharArray();
    public static String bytesToHex(byte[] bytes) {
        char[] hexChars = new char[bytes.length * 2];
        for ( int j = 0; j < bytes.length; j++ ) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }

    public static void main(String[] args) {
        if (args.length > 0) {
            System.out.println(args[0]);
            if (args[0].equals("-d")) {
                if (args.length > 1) {
                    java.math.BigDecimal bDec = new java.math.BigDecimal(args[1]);
                    int bInt = bDec.scale();
                    java.nio.ByteBuffer buff = java.nio.ByteBuffer.allocate(4);
                    buff.order(java.nio.ByteOrder.BIG_ENDIAN);
                    byte[] arr1 = buff.putInt(bInt).array();
                    byte[] arr2 = bDec.unscaledValue().toByteArray();
                    System.out.println(bytesToHex(arr1));
                    byte[] c = new byte[arr1.length + arr2.length];
                    System.arraycopy(arr1, 0, c, 0, arr1.length);
                    System.arraycopy(arr2, 0, c, arr1.length, arr2.length);
                    System.out.println(bytesToHex(c));
                } else {
                    System.out.println("Missing Decimal Number");
                    System.out.println("Usage: java TestVarint -d <n>");
                    System.out.println("  where n is a decimal number");
                }
            } else {
                System.out.println(
                        bytesToHex(
                            new java.math.BigInteger(args[0]).toByteArray()
                        )
                );
            }
        } else {
            System.out.println("Encode Java BigInteger Varints and BigDecimal Decimal & print them as hex");
            System.out.println("Usage: java TestVarint <n>");
            System.out.println("  where n is a number");
            System.out.println("Use '-d' flag for Decimal Number");
        }
    }
}
