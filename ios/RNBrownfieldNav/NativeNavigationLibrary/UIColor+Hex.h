//
//  UIColor+Hex.h
//  PPFoundation
//
//  Created by Salvatore Randazzo on 10/28/14.
//  Copyright (c) 2014 Paperless Inc. All rights reserved.
//

#import <UIKit/UIKit.h>

/**
 *  Taken from: https://github.com/thisandagain/color/tree/master/EDColor
 *  Unbundled to fit into our framework
 */
@interface UIColor (Hex)

+ (UIColor *)colorWithHex:(UInt32)hex andAlpha:(CGFloat)alpha;

+ (UIColor *)colorWithHex:(UInt32)hex;

+ (UIColor *)colorWithHexString:(id)input;

- (UInt32)hexValue;

@end
